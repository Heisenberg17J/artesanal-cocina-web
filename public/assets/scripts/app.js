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
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-lg text-gray-600">${mensaje}</p>
                <p class="text-sm text-gray-500 mt-2">
                    Verifica tu configuración de Supabase
                </p>
            </div>
        `;
    }
}

/**
 * Muestra un loader en el contenedor especificado
 * @param {string} containerId - ID del contenedor
 */
function mostrarLoader(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="loading loading-spinner loading-lg text-[#D97757]"></div>
                <p class="mt-4 text-gray-500">Cargando...</p>
            </div>
        `;
    }
}

// ==========================================
// CARGAR MENÚ DE PLATOS
// ==========================================

/**
 * Carga todos los platos del menú desde Supabase
 */
async function cargarMenu() {
    debug('Iniciando carga del menú...');
    
    try {
        // Obtener todos los platos de la tabla 'platos'
        const { data: platos, error } = await supabase
            .from('platos')
            .select('*')
            .eq('disponible', true) // Solo platos disponibles
            .order('nombre', { ascending: true });

        if (error) {
            console.error('❌ Error al cargar platos:', error);
            mostrarError('comidas-rapidas', 'No se pudieron cargar los platos');
            mostrarError('almuerzos', 'No se pudieron cargar los platos');
            mostrarError('especiales', 'No se pudieron cargar los platos');
            return;
        }

        debug('Platos cargados:', platos);

        // Separar platos por categoría
        const comidasRapidas = platos.filter(p => p.categoria === 'comidas_rapidas');
        const almuerzos = platos.filter(p => p.categoria === 'almuerzos');
        const especiales = platos.filter(p => p.categoria === 'especiales');

        // Renderizar cada categoría
        renderPlatos('comidas-rapidas', comidasRapidas);
        renderPlatos('almuerzos', almuerzos);
        renderPlatos('especiales', especiales);

    } catch (error) {
        console.error('💥 Error crítico al cargar menú:', error);
        mostrarError('comidas-rapidas', 'Error de conexión');
    }
}

/**
 * Renderiza una lista de platos en el contenedor especificado
 * @param {string} containerId - ID del contenedor HTML
 * @param {Array} platos - Array de objetos plato
 */
function renderPlatos(containerId, platos) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`❌ Contenedor ${containerId} no encontrado`);
        return;
    }

    // Si no hay platos, mostrar mensaje
    if (!platos || platos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-5xl mb-4">🍽️</div>
                <p class="text-gray-500">Próximamente nuevos platos en esta categoría</p>
            </div>
        `;
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Crear tarjeta para cada plato
    platos.forEach(plato => {
        const whatsappMsg = `Hola! Quiero pedir: ${plato.nombre} - $${plato.precio.toLocaleString()}`;
        const whatsappUrl = generarWhatsAppURL(whatsappMsg);
        
        // Imagen por defecto si no tiene
        const imagenUrl = plato.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen';
        
        const card = document.createElement('div');
        card.className = 'card bg-base-100 shadow-xl card-hover';
        card.innerHTML = `
            <figure class="h-64 overflow-hidden">
                <img src="${imagenUrl}" 
                     alt="${plato.nombre}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Imagen+no+disponible'">
            </figure>
            <div class="card-body">
                <h2 class="card-title text-[#8B4513]">${plato.nombre}</h2>
                <p class="text-gray-600">${plato.descripcion || 'Delicioso plato preparado con amor'}</p>
                <div class="card-actions justify-between items-center mt-4">
                    <span class="text-2xl font-bold text-[#D97757]">
                        $${plato.precio.toLocaleString('es-CO')}
                    </span>
                    <a href="${whatsappUrl}" 
                       class="btn whatsapp-btn text-white" 
                       target="_blank"
                       rel="noopener noreferrer">
                        Pedir 🛒
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    debug(`Renderizados ${platos.length} platos en ${containerId}`);
}

// ==========================================
// CARGAR GALERÍA DE FOTOS
// ==========================================

/**
 * Carga las fotos de la galería desde Supabase Storage
 */
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
// CARGAR PROMOCIONES
// ==========================================

/**
 * Carga las promociones activas desde Supabase
 */
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

        // Limpiar contenedor
        container.innerHTML = '';

        // Crear tarjeta para cada promoción
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
// SMOOTH SCROLL PARA NAVEGACIÓN
// ==========================================

function inicializarNavegacion() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });
    debug('Navegación smooth scroll inicializada');
}

// ==========================================
// DIAGNÓSTICO DE CONEXIÓN
// ==========================================

/**
 * Prueba la conexión con Supabase y muestra información de debug
 */
async function diagnosticarConexion() {
    console.log('🔍 ===== DIAGNÓSTICO DE CONEXIÓN =====');
    console.log('📌 Supabase URL:', CONFIG.SUPABASE_URL);
    console.log('🔑 Supabase Key (primeros 20 caracteres):', 
                CONFIG.SUPABASE_KEY.substring(0, 20) + '...');
    
    // Probar conexión al bucket de galería
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
            if (data.length > 0) {
                console.log('📋 Primeros archivos:', data.map(f => f.name));
                
                // Mostrar URLs de las primeras imágenes
                data.slice(0, 3).forEach(file => {
                    const { data: urlData } = supabase.storage
                        .from('galeria')
                        .getPublicUrl(file.name);
                    console.log(`🖼️  ${file.name}: ${urlData.publicUrl}`);
                });
            }
        }
    } catch (err) {
        console.error('💥 Error crítico en Storage:', err);
    }
    
    // Probar conexión a la tabla de platos
    try {
        const { data, error } = await supabase
            .from('platos')
            .select('count');
        
        if (error) {
            console.error('❌ Error al conectar con tabla platos:', error);
            console.log('💡 Solución: Verifica que la tabla "platos" exista');
        } else {
            console.log('✅ Conexión con tabla "platos" exitosa!');
        }
    } catch (err) {
        console.error('💥 Error crítico en tabla platos:', err);
    }
    
    // Probar conexión a la tabla de promociones
    try {
        const { data, error } = await supabase
            .from('promociones')
            .select('count');
        
        if (error) {
            console.error('❌ Error al conectar con tabla promociones:', error);
            console.log('💡 Solución: Verifica que la tabla "promociones" exista');
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

/**
 * Inicializa la aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación Cocina Artesanal...');
    
    // Ejecutar diagnóstico si está en modo debug
    if (CONFIG.DEBUG_MODE) {
        await diagnosticarConexion();
    }
    
    // Inicializar navegación
    inicializarNavegacion();
    
    // Cargar contenido de forma paralela
    console.log('📥 Cargando contenido...');
    await Promise.all([
        cargarMenu(),
        cargarGaleria(),
        cargarPromociones()
    ]);
    
    console.log('✅ Aplicación inicializada correctamente');
    console.log('💡 TIP: Presiona F12 para ver información de debug');
});