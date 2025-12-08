// ==========================================
// CARGAR COMBOS ESPECIALES CON RESTRICCIONES
// ==========================================

async function cargarCombos() {
    const container = document.getElementById('combos-container');
    
    try {
        const { data: combos, error } = await supabase
            .from('combos')
            .select('*')
            .eq('disponible', true)
            .order('orden', { ascending: true });

        if (error) throw error;

        if (combos.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🍽️</div>
                    <p class="text-gray-500">Próximamente combos especiales</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        combos.forEach(combo => {
            const imagenUrl = combo.imagen_url || 'https://sxojkdrkouhokhylnkjj.supabase.co/storage/v1/object/public/platos/comida-default.jpg';
            const cantidadEnCarrito = obtenerCantidadEnCarrito(combo.id);
            const descuento = combo.descuento || 0;
            
            // Restricciones
            const cantidadMinima = combo.cantidad_minima || 1;
            const cantidadMaxima = combo.cantidad_maxima || null;
            const mensajeRestriccion = combo.mensaje_restriccion || '';
            
            // Verificar si la cantidad actual cumple las restricciones
            const cumpleMinimo = cantidadEnCarrito >= cantidadMinima;
            const cumpleMaximo = !cantidadMaxima || cantidadEnCarrito <= cantidadMaxima;
            const puedeAgregar = cumpleMinimo && cumpleMaximo;
            
            const card = document.createElement('div');
            card.className = 'combo-card rounded-2xl shadow-2xl overflow-hidden relative';
            card.innerHTML = `
                ${descuento > 0 ? `
                    <div class="combo-badge">
                        💥 ${descuento}% OFF
                    </div>
                ` : ''}
                
                <div class="relative z-10 p-6">
                    <!-- Imagen -->
                    <div class="mb-6 rounded-xl overflow-hidden shadow-lg">
                        <img src="${imagenUrl}" 
                             alt="${combo.nombre}" 
                             class="w-full h-64 object-cover transform hover:scale-110 transition duration-500"
                             onerror="this.src='https://via.placeholder.com/600x400?text=Combo+Especial'">
                    </div>

                    <!-- Contenido -->
                    <div class="text-white">
                        <h3 class="text-3xl font-bold mb-3">${combo.nombre}</h3>
                        <p class="text-white/90 text-lg mb-4 leading-relaxed">
                            ${combo.descripcion || 'Deliciosa combinación de nuestros mejores platos'}
                        </p>

                        <!-- Mensaje de restricción -->
                        ${mensajeRestriccion ? `
                            <div class="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 mb-4">
                                <p class="text-sm text-yellow-100 font-medium">
                                    ${mensajeRestriccion}
                                </p>
                            </div>
                        ` : ''}

                        <!-- Items del combo -->
                        ${combo.items ? `
                            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                                <h4 class="font-bold text-sm mb-2 uppercase tracking-wide">Incluye:</h4>
                                <ul class="space-y-1 text-sm">
                                    ${combo.items.split(',').map(item => `
                                        <li class="flex items-center gap-2">
                                            <span class="text-[#b4d471]">✓</span>
                                            <span>${item.trim()}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <!-- Horario si existe -->
                        ${combo.horario ? `
                            <div class="flex items-center gap-2 mb-4 text-sm">
                                <span>🕐</span>
                                <span class="text-white/80">${combo.horario}</span>
                            </div>
                        ` : ''}

                        <!-- Precio y acciones -->
                        <div class="flex items-center justify-between mt-6">
                            <div class="combo-price">
                                $${combo.precio.toLocaleString('es-CO')}
                            </div>
                            ${cantidadMinima > 1 ? `
                                <div class="text-xs px-3 py-1 rounded-full" style="background: rgba(255,255,255,0.2)">
                                    Min: ${cantidadMinima} uni.
                                </div>
                            ` : ''}
                        </div>

                        <!-- Botón Agregar (solo si no está en carrito) -->
                        <button onclick='agregarComboAlCarrito(${JSON.stringify(combo).replace(/'/g, "\\'")})'
                                data-plato-id="${combo.id}"
                                data-action="add"
                                class="btn btn-lg w-full mt-4 border-0 text-white ${cantidadEnCarrito > 0 ? 'hidden' : ''}"
                                style="background: var(--color-green); color: var(--color-dark)">
                            <span class="text-lg font-bold">Agregar Combo 🛒</span>
                        </button>
                        
                        <!-- Controles de cantidad con restricciones -->
                        <div data-plato-id="${combo.id}" 
                             data-action="remove"
                             class="w-full mt-4 ${cantidadEnCarrito > 0 ? '' : 'hidden'}">
                            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <button onclick="quitarDelCarrito(${combo.id})" 
                                            class="btn btn-error btn-sm">
                                        Quitar Todo
                                    </button>
                                    <div class="cantidad-control flex items-center gap-4">
                                        <button onclick="decrementarCombo(${combo.id}, ${cantidadMinima})" 
                                                class="btn btn-circle btn-sm ${cantidadEnCarrito <= cantidadMinima ? 'opacity-50 cursor-not-allowed' : ''}"
                                                style="background: rgba(255,255,255,0.2)"
                                                ${cantidadEnCarrito <= cantidadMinima ? 'disabled' : ''}>
                                            −
                                        </button>
                                        <span data-plato-cantidad="${combo.id}" 
                                              class="font-bold text-2xl">
                                            ${cantidadEnCarrito}
                                        </span>
                                        <button onclick="incrementarCombo(${combo.id}, ${cantidadMaxima || 999})" 
                                                class="btn btn-circle btn-sm ${cantidadMaxima && cantidadEnCarrito >= cantidadMaxima ? 'opacity-50 cursor-not-allowed' : ''}"
                                                style="background: var(--color-green); color: var(--color-dark)"
                                                ${cantidadMaxima && cantidadEnCarrito >= cantidadMaxima ? 'disabled' : ''}>
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Indicador de restricción -->
                                ${!puedeAgregar ? `
                                    <div class="text-center text-xs text-yellow-200 mt-2">
                                        ${!cumpleMinimo ? `⚠️ Cantidad mínima: ${cantidadMinima} unidades` : ''}
                                        ${!cumpleMaximo ? `⚠️ Cantidad máxima: ${cantidadMaxima} unidades` : ''}
                                    </div>
                                ` : `
                                    <div class="text-center text-xs text-green-200 mt-2">
                                        ✓ Cumple con los requisitos
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando combos:', error);
        container.innerHTML = `
            <div class="col-span-full alert alert-error">
                <span>Error al cargar los combos. Verifica la conexión.</span>
            </div>
        `;
    }
}

// ==========================================
// FUNCIONES ESPECIALES PARA COMBOS
// ==========================================

/**
 * Agregar combo al carrito con validación de cantidad mínima
 */
function agregarComboAlCarrito(combo) {
    const cantidadMinima = combo.cantidad_minima || 1;
    
    // Buscar si ya existe en el carrito
    const index = carrito.findIndex(item => item.id === combo.id);
    
    if (index !== -1) {
        // Si ya existe, incrementar
        carrito[index].cantidad += cantidadMinima;
    } else {
        // Si no existe, agregar con la cantidad mínima
        carrito.push({
            id: combo.id,
            nombre: combo.nombre,
            precio: combo.precio,
            imagen_url: combo.imagen_url,
            cantidad: cantidadMinima,
            tipo: 'combo',
            cantidad_minima: cantidadMinima,
            cantidad_maxima: combo.cantidad_maxima || null
        });
    }
    
    guardarCarrito();
    
    if (cantidadMinima > 1) {
        mostrarNotificacion(
            `${combo.nombre} agregado (${cantidadMinima} unidades - mínimo requerido)`, 
            'success'
        );
    } else {
        mostrarNotificacion(`${combo.nombre} agregado al carrito`, 'success');
    }
    
    actualizarBotonesPlato(combo.id);
}

/**
 * Incrementar combo con validación de máximo
 */
function incrementarCombo(comboId, cantidadMaxima) {
    const index = carrito.findIndex(item => item.id === comboId);
    
    if (index !== -1) {
        const nuevaCantidad = carrito[index].cantidad + 1;
        
        // Validar máximo
        if (cantidadMaxima && nuevaCantidad > cantidadMaxima) {
            mostrarNotificacion(
                `⚠️ Cantidad máxima permitida: ${cantidadMaxima} unidades`, 
                'warning'
            );
            return;
        }
        
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarBotonesPlato(comboId);
        renderizarCarrito();
    }
}

/**
 * Decrementar combo con validación de mínimo
 */
function decrementarCombo(comboId, cantidadMinima) {
    const index = carrito.findIndex(item => item.id === comboId);
    
    if (index !== -1) {
        const nuevaCantidad = carrito[index].cantidad - 1;
        
        // Si llega al mínimo o menos, quitar del carrito
        if (nuevaCantidad < cantidadMinima) {
            if (confirm(`¿Deseas eliminar este combo del carrito? (No cumple el mínimo de ${cantidadMinima} unidades)`)) {
                quitarDelCarrito(comboId);
            }
            return;
        }
        
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarBotonesPlato(comboId);
        renderizarCarrito();
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

        container.innerHTML = '';

        imagenes.forEach(file => {
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
// CARGAR MENÚ REGULAR
// ==========================================

async function cargarMenu() {
    console.log('Iniciando carga del menú...');
    
    try {
        const { data: platos, error } = await supabase
            .from('platos')
            .select('*')
            .eq('disponible', true)
            .order('orden', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) {
            console.error('❌ Error al cargar platos:', error);
            return;
        }

        console.log('Platos cargados:', platos);

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
    }
}

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
                <h2 class="card-title text-lg" style="color: var(--color-dark)">${plato.nombre}</h2>
                <p class="text-gray-600 text-sm line-clamp-3">
                    ${plato.descripcion || 'Delicioso plato preparado con amor'}
                </p>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-xl font-bold" style="color: var(--color-orange)">
                        $${plato.precio.toLocaleString('es-CO')}
                    </span>
                </div>
                
                <button onclick='agregarAlCarrito(${JSON.stringify(plato).replace(/'/g, "\\'")})'
                        data-plato-id="${plato.id}"
                        data-action="add"
                        class="btn btn-sm text-white w-full mt-2 border-0 ${cantidadEnCarrito > 0 ? 'hidden' : ''}"
                        style="background: var(--color-orange)">
                    Agregar al carrito 🛒
                </button>
                
                <div data-plato-id="${plato.id}" 
                     data-action="remove"
                     class="w-full mt-2 ${cantidadEnCarrito > 0 ? '' : 'hidden'}">
                    <div class="flex items-center justify-between rounded-lg p-2" style="background: var(--color-cream)">
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
                                    class="cantidad-btn text-white"
                                    style="background: var(--color-orange)">
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// INICIALIZACIÓN CON ORDEN
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación...');
    
    // PRIMERO: Asegurar que el carrito esté inicializado
    if (typeof inicializarCarrito === 'function') {
        inicializarCarrito();
    }
    
    // Pequeña pausa para asegurar sincronización
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // SEGUNDO: Cargar datos
    await Promise.all([
        cargarCombos(),
        cargarMenu(),
        cargarGaleria()
    ]);
    
    console.log('✅ Aplicación inicializada');

});
