// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================

/**
 * Genera URL de WhatsApp con mensaje personalizado
 * @param {string} mensaje - Mensaje a enviar
 * @returns {string} URL completa de WhatsApp
 */
function generarWhatsAppURL(mensaje) {
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
}

/**
 * Muestra un mensaje de error en el contenedor especificado
 * @param {string} containerId - ID del contenedor
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(containerId, mensaje) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-12 w-full">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-lg text-gray-600">${mensaje}</p>
                <p class="text-sm text-gray-500 mt-2">
                    Verifica tu configuración de Supabase
                </p>
            </div>
        `;
    }
}

// ==========================================
// CARGAR MENÚ DE PLATOS CON CARRITO
// ==========================================

/**
 * Carga todos los platos del menú desde Supabase
 */
async function cargarMenu() {
    debug('Iniciando carga del menú...');
    
    try {
        const { data: platos, error } = await supabase
            .from('platos')
            .select('*')
            .eq('disponible', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('❌ Error al cargar platos:', error);
            mostrarError('entradas', 'No se pudo cargar el menú');
            mostrarError('arroces', 'No se pudo cargar el menú');
            mostrarError('ensaladas', 'No se pudo cargar el menú');
            mostrarError('carnes-tradicionales', 'No se pudo cargar el menú');
            mostrarError('carnes-especiales', 'No se pudo cargar el menú');
            return;
        }

        debug('Platos cargados:', platos);

        // Separar platos por categoría
        const entradas = platos.filter(p => p.categoria === 'entradas');
        const arroces = platos.filter(p => p.categoria === 'arroces');
        const ensaladas = platos.filter(p => p.categoria === 'ensaladas');
        const carnes_tradicionales = platos.filter(p => p.categoria === 'carnes-tradicionales');
        const carnes_especiales = platos.filter(p => p.categoria === 'carnes-especiales');

        // Renderizar cada categoría
        renderPlatosHorizontal('entradas', entradas);
        renderPlatosHorizontal('arroces', arroces);
        renderPlatosHorizontal('ensaladas', ensaladas);
        renderPlatosHorizontal('carnes-tradicionales', carnes_tradicionales);
        renderPlatosHorizontal('carnes-especiales', carnes_especiales);

    } catch (error) {
        console.error('💥 Error crítico al cargar menú:', error);
        mostrarError('comidas-rapidas', 'Error de conexión');
    }
}

/**
 * Renderiza platos en formato horizontal (scroll)
 * @param {string} containerId - ID del contenedor HTML
 * @param {Array} platos - Array de objetos plato
 */
function renderPlatosHorizontal(containerId, platos) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`❌ Contenedor ${containerId} no encontrado`);
        return;
    }

    if (!platos || platos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 w-full">
                <div class="text-5xl mb-4">🍽️</div>
                <p class="text-gray-500">Próximamente nuevos platos en esta categoría</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    platos.forEach(plato => {
        const imagenUrl = plato.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen';
        const cantidadEnCarrito = obtenerCantidadEnCarrito(plato.id);
        
        const card = document.createElement('div');
        card.className = 'plato-card card bg-base-100 shadow-xl flex-shrink-0';
        card.innerHTML = `
            <figure class="h-48 overflow-hidden">
                <img src="${imagenUrl}" 
                     alt="${plato.nombre}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Imagen+no+disponible'">
            </figure>
            <div class="card-body p-4">
                <h2 class="card-title text-[#8B4513] text-lg">${plato.nombre}</h2>
                <p class="text-gray-600 text-sm line-clamp-3">
                    ${plato.descripcion || 'Delicioso plato preparado con amor'}
                </p>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-xl font-bold text-[#D97757]">
                        $${plato.precio.toLocaleString('es-CO')}
                    </span>
                </div>
                
                <!-- Botón Agregar -->
                <button onclick='agregarAlCarrito(${JSON.stringify(plato).replace(/'/g, "\\'")})'
                        data-plato-id="${plato.id}"
                        data-action="add"
                        class="btn btn-sm bg-[#D97757] hover:bg-[#C86747] text-white w-full mt-2 ${cantidadEnCarrito > 0 ? 'hidden' : ''}">
                    Agregar al carrito 🛒
                </button>
                
                <!-- Controles de cantidad -->
                <div data-plato-id="${plato.id}" 
                     data-action="remove"
                     class="w-full mt-2 ${cantidadEnCarrito > 0 ? '' : 'hidden'}">
                    <div class="flex items-center justify-between bg-[#FFF8DC] rounded-lg p-2">
                        <button onclick="quitarDelCarrito(${plato.id})" 
                                class="btn btn-sm btn-error">
                            Quitar
                        </button>
                        <div class="cantidad-control">
                            <button onclick="decrementarCantidad(${plato.id})" 
                                    class="cantidad-btn bg-gray-300 hover:bg-gray-400">
                                −
                            </button>
                            <span data-plato-cantidad="${plato.id}" class="font-bold text-lg mx-2">
                                ${cantidadEnCarrito}
                            </span>
                            <button onclick="incrementarCantidad(${plato.id})" 
                                    class="cantidad-btn bg-[#D97757] hover:bg-[#C86747] text-white">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    debug(`Renderizados ${platos.length} platos en ${containerId}`);
}

// ==========================================
// CARGAR PROMOCIONES
// ==========================================

async function cargarPromociones() {
    debug('Iniciando carga de promociones...');
    
    const container = document.getElementById('promociones-container');
    
    if (!container) {
        console.error('❌ Contenedor de promociones no encontrado');
        return;
    }
    
    try {
        const { data: promociones, error } = await supabase
            .from('promociones')
            .select('*')
            .eq('activa', true)
            .order('orden', { ascending: true });

        if (error) {
            console.error('❌ Error al cargar promociones:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🎉</div>
                    <p class="text-lg">No hay promociones disponibles</p>
                </div>
            `;
            return;
        }

        debug('Promociones cargadas:', promociones);

        if (promociones.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🎊</div>
                    <p class="text-lg">Próximamente nuevas promociones</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        promociones.forEach(promo => {
            const card = document.createElement('div');
            card.className = 'card bg-white/10 backdrop-blur-lg shadow-2xl';
            card.innerHTML = `
                <div class="card-body">
                    <h3 class="card-title text-2xl text-white">${promo.titulo}</h3>
                    <p class="text-white/90 text-lg">${promo.descripcion}</p>
                    ${promo.precio ? `
                        <div class="badge badge-lg bg-yellow-400 text-[#8B4513] font-bold">
                            $${promo.precio.toLocaleString('es-CO')}
                        </div>
                    ` : ''}
                    ${promo.horario ? `
                        <p class="text-white/80 mt-2">
                            🕐 ${promo.horario}
                        </p>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(card);
        });

        debug(`Renderizadas ${promociones.length} promociones`);

    } catch (error) {
        console.error('💥 Error crítico al cargar promociones:', error);
    }
}

// ==========================================
// CARGAR GALERÍA DE FOTOS
// ==========================================

async function cargarGaleria() {
    debug('Iniciando carga de galería...');
    
    const container = document.getElementById('galeria-container');
    
    if (!container) {
        console.error('❌ Contenedor de galería no encontrado');
        return;
    }
    
    try {
        // Obtener lista de archivos del bucket 'galeria'
        const { data: files, error } = await supabase
            .storage
            .from('galeria')
            .list('', {
                limit: CONFIG.GALLERY_LIMIT,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('❌ Error al cargar galería:', error);
            container.innerHTML = `
                <div class="w-full text-center py-12">
                    <div class="text-6xl mb-4">📷</div>
                    <p class="text-lg text-gray-600">No se pudo cargar la galería</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Verifica que el bucket 'galeria' exista y sea público
                    </p>
                </div>
            `;
            return;
        }

        debug('Archivos encontrados:', files);

        // Filtrar solo imágenes
        const imagenes = files.filter(file => 
            file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );

        if (imagenes.length === 0) {
            container.innerHTML = `
                <div class="w-full text-center py-12">
                    <div class="text-6xl mb-4">📸</div>
                    <p class="text-lg text-gray-600">Aún no hay fotos en la galería</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Sube imágenes al bucket 'galeria' en Supabase
                    </p>
                </div>
            `;
            return;
        }

        // Limpiar contenedor
        container.innerHTML = '';

        // Crear elemento para cada imagen
        imagenes.forEach(file => {
            // Obtener URL pública de cada imagen
            const { data } = supabase.storage
                .from('galeria')
                .getPublicUrl(file.name);

            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'masonry-item';
            imgWrapper.innerHTML = `
                <img src="${data.publicUrl}" 
                     alt="Galería ${file.name}" 
                     class="w-full rounded-lg shadow-lg hover:shadow-2xl transition cursor-pointer"
                     onclick="window.open('${data.publicUrl}', '_blank')"
                     loading="lazy"
                     onerror="this.parentElement.remove()">
            `;
            
            container.appendChild(imgWrapper);
        });

        debug(`Renderizadas ${imagenes.length} imágenes en la galería`);

    } catch (error) {
        console.error('💥 Error crítico al cargar galería:', error);
        container.innerHTML = `
            <div class="w-full text-center py-12">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-lg text-gray-600">Error de conexión</p>
            </div>
        `;
    }
}

// ==========================================
// DIAGNÓSTICO DE CONEXIÓN
// ==========================================

async function diagnosticarConexion() {
    console.log('🔍 ===== DIAGNÓSTICO DE CONEXIÓN =====');
    console.log('📌 Supabase URL:', CONFIG.SUPABASE_URL);
    console.log('🔑 Supabase Key (primeros 20 caracteres):', 
                CONFIG.SUPABASE_KEY.substring(0, 20) + '...');
    
    try {
        const { data, error } = await supabase.storage
            .from('galeria')
            .list('', { limit: 5 });
        
        if (error) {
            console.error('❌ Error al conectar con Storage:', error);
            console.log('💡 Solución: Verifica que el bucket "galeria" exista y sea público');
        } else {
            console.log('✅ Conexión con Storage exitosa!');
            console.log('📁 Archivos encontrados:', data.length);
        }
    } catch (err) {
        console.error('💥 Error crítico en Storage:', err);
    }
    
    try {
        const { data, error } = await supabase
            .from('platos')
            .select('count');
        
        if (error) {
            console.error('❌ Error al conectar con tabla platos:', error);
        } else {
            console.log('✅ Conexión con tabla "platos" exitosa!');
        }
    } catch (err) {
        console.error('💥 Error crítico en tabla platos:', err);
    }
    
    try {
        const { data, error } = await supabase
            .from('promociones')
            .select('count');
        
        if (error) {
            console.error('❌ Error al conectar con tabla promociones:', error);
        } else {
            console.log('✅ Conexión con tabla "promociones" exitosa!');
        }
    } catch (err) {
        console.error('💥 Error crítico en tabla promociones:', err);
    }
    
    console.log('🔍 ===== FIN DEL DIAGNÓSTICO =====');
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación Cocina Artesanal...');
    
    if (CONFIG.DEBUG_MODE) {
        await diagnosticarConexion();
    }
    
    console.log('📥 Cargando contenido...');
    await Promise.all([
        cargarMenu(),
        cargarPromociones(),
        cargarGaleria()
    ]);
    
    console.log('✅ Aplicación inicializada correctamente');
    console.log('💡 TIP: Presiona F12 para ver información de debug');

});
