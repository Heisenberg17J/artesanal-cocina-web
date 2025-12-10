// ==========================================
// SISTEMA DE CARRITO DE COMPRAS - MEJORADO
// ==========================================

// Estado del carrito (se guarda en localStorage)
let carrito = [];

/**
 * Inicializa el carrito desde localStorage
 */
function inicializarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarBadgeCarrito();
    }
}

/**
 * Guarda el carrito en localStorage
 */
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
}

/**
 * Agrega un plato al carrito
 * @param {Object} plato - Objeto con los datos del plato
 */
function agregarAlCarrito(plato) {
    const index = carrito.findIndex(item => item.id === plato.id);
    
    if (index !== -1) {
        carrito[index].cantidad++;
    } else {
        carrito.push({
            id: plato.id,
            nombre: plato.nombre,
            precio: plato.precio,
            imagen_url: plato.imagen_url,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    mostrarNotificacion(`${plato.nombre} agregado al carrito`, 'success');
    actualizarBotonesPlato(plato.id);
}

/**
 * Elimina un plato del carrito completamente
 * @param {number} platoId - ID del plato
 */
function quitarDelCarrito(platoId) {
    const index = carrito.findIndex(item => item.id === platoId);
    
    if (index !== -1) {
        const nombrePlato = carrito[index].nombre;
        carrito.splice(index, 1);
        guardarCarrito();
        mostrarNotificacion(`${nombrePlato} eliminado del carrito`, 'info');
        actualizarBotonesPlato(platoId);
        renderizarCarrito();
    }
}

/**
 * Incrementa la cantidad de un plato en el carrito
 * @param {number} platoId - ID del plato
 */
function incrementarCantidad(platoId) {
    const index = carrito.findIndex(item => item.id === platoId);
    if (index !== -1) {
        carrito[index].cantidad++;
        guardarCarrito();
        actualizarBotonesPlato(platoId);
        renderizarCarrito();
    }
}

/**
 * Decrementa la cantidad de un plato en el carrito
 * @param {number} platoId - ID del plato
 */
function decrementarCantidad(platoId) {
    const index = carrito.findIndex(item => item.id === platoId);
    if (index !== -1) {
        const item = carrito[index];
        const cantidadMinima = item.cantidad_minima || 1;
        
        if (item.cantidad > cantidadMinima) {
            item.cantidad--;
            guardarCarrito();
            actualizarBotonesPlato(platoId);
            renderizarCarrito();
        } else if (item.cantidad === cantidadMinima) {
            quitarDelCarrito(platoId);
        }
    }
}

/**
 * Vacía el carrito completamente
 */
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        mostrarNotificacion('Carrito vaciado', 'info');
        
        document.querySelectorAll('[data-plato-id]').forEach(element => {
            const platoId = parseInt(element.getAttribute('data-plato-id'));
            actualizarBotonesPlato(platoId);
        });
    }
}

/**
 * Obtiene la cantidad de un plato en el carrito
 * @param {number} platoId - ID del plato
 * @returns {number} Cantidad del plato en el carrito
 */
function obtenerCantidadEnCarrito(platoId) {
    const item = carrito.find(item => item.id === platoId);
    return item ? item.cantidad : 0;
}

/**
 * Actualiza el badge del carrito con la cantidad total de items
 */
function actualizarBadgeCarrito() {
    const badge = document.getElementById('cart-badge');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/**
 * Actualiza los botones de un plato específico
 * @param {number} platoId - ID del plato
 */
function actualizarBotonesPlato(platoId) {
    const cantidad = obtenerCantidadEnCarrito(platoId);
    const btnAgregar = document.querySelector(`[data-plato-id="${platoId}"][data-action="add"]`);
    const controlesContainer = document.querySelector(`[data-plato-id="${platoId}"][data-action="remove"]`);
    const cantidadSpan = document.querySelector(`[data-plato-cantidad="${platoId}"]`);
    
    if (cantidad > 0) {
        if (btnAgregar) btnAgregar.classList.add('hidden');
        if (controlesContainer) controlesContainer.classList.remove('hidden');
        if (cantidadSpan) cantidadSpan.textContent = cantidad;
    } else {
        if (btnAgregar) btnAgregar.classList.remove('hidden');
        if (controlesContainer) controlesContainer.classList.add('hidden');
    }
}

/**
 * Abre el modal del carrito
 */
function abrirCarrito() {
    renderizarCarrito();
    const modal = document.getElementById('cart-modal');
    modal.classList.add('modal-open');
}

/**
 * Cierra el modal del carrito
 */
function cerrarCarrito() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('modal-open');
}

/**
 * Renderiza el contenido del carrito en el modal
 */
function renderizarCarrito() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🛒</div>
                <p class="text-lg text-gray-600">Tu carrito está vacío</p>
                <p class="text-sm text-gray-500 mt-2">¡Agrega algunos platos deliciosos!</p>
            </div>
        `;
        totalElement.textContent = '$0';
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    
    container.innerHTML = '';
    carrito.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex gap-4 bg-white rounded-lg p-3 shadow-sm';
        itemDiv.innerHTML = `
            <img src="${item.imagen_url || 'https://via.placeholder.com/80x80'}" 
                 alt="${item.nombre}" 
                 class="w-20 h-20 object-cover rounded-lg"
                 onerror="this.src='https://via.placeholder.com/80x80'">
            
            <div class="flex-1">
                <h4 class="font-bold text-[#8B4513]">${item.nombre}</h4>
                <p class="text-[#D97757] font-semibold">$${item.precio.toLocaleString('es-CO')}</p>
                
                <div class="cantidad-control mt-2">
                    <button onclick="decrementarCantidad(${item.id})" 
                            class="cantidad-btn bg-gray-300 hover:bg-gray-400">
                        −
                    </button>
                    <span class="font-semibold min-w-[30px] text-center">${item.cantidad}</span>
                    <button onclick="incrementarCantidad(${item.id})" 
                            class="cantidad-btn bg-[#D97757] hover:bg-[#C86747] text-white">
                        +
                    </button>
                </div>
            </div>
            
            <div class="flex flex-col justify-between items-end">
                <button onclick="quitarDelCarrito(${item.id})" 
                        class="btn btn-ghost btn-sm btn-circle text-error">
                    ✕
                </button>
                <span class="font-bold text-lg">
                    $${(item.precio * item.cantidad).toLocaleString('es-CO')}
                </span>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}


/**
 * Valida un campo individual y aplica estilos visuales
 * @param {HTMLElement} input - Campo de input a validar
 * @returns {boolean} true si es válido, false si no
 */
function validarCampo(input) {
    const valor = input.value.trim();
    let esValido = false;
    
    // Validación según tipo de campo
    switch(input.id) {
        case 'customer-name':
            esValido = valor.length >= 3;
            break;
            
        case 'customer-email':
            esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
            break;
            
        case 'customer-address':
            esValido = valor.length >= 10;
            break;
            
        case 'delivery-zone':
            esValido = valor !== '';
            break;
            
        case 'delivery-date':
            esValido = valor !== '';
            break;
            
        case 'delivery-time':
            esValido = valor !== '';
            break;
            
        default:
            esValido = valor !== '';
    }
    
    // Aplicar estilos visuales
    if (esValido) {
        input.classList.remove('input-error', 'border-red-500');
        input.classList.add('input-success', 'border-green-500');
    } else {
        input.classList.remove('input-success', 'border-green-500');
        input.classList.add('input-error', 'border-red-500');
    }
    
    return esValido;
}

/**
 * Valida todos los campos del formulario visualmente
 * @returns {boolean} true si todos son válidos
 */
function validarFormularioVisual() {
    const campos = [
        document.getElementById('customer-name'),
        document.getElementById('customer-email'),
        document.getElementById('customer-address'),
        document.getElementById('delivery-zone'),
        document.getElementById('delivery-date'),
        document.getElementById('delivery-time')
        // El teléfono es opcional, no lo agregamos aquí
    ];
    
    let todosValidos = true;
    
    campos.forEach(campo => {
        if (campo) {
            const esValido = validarCampo(campo);
            if (!esValido) todosValidos = false;
        }
    });
    
    return todosValidos;
}

/**
 * Inicializa la validación en tiempo real
 */
function inicializarValidacion() {
    const campos = [
        'customer-name',
        'customer-email', 
        'customer-address',
        'delivery-zone',
        'delivery-date',
        'delivery-time'
    ];
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            // Validar al escribir (con pequeño delay)
            campo.addEventListener('input', () => {
                if (campo.value.trim() !== '') {
                    validarCampo(campo);
                } else {
                    // Limpiar estilos si está vacío
                    campo.classList.remove('input-error', 'input-success', 'border-red-500', 'border-green-500');
                }
            });
            
            // Validar al perder el foco
            campo.addEventListener('blur', () => {
                if (campo.value.trim() !== '') {
                    validarCampo(campo);
                }
            });
        }
    });
}



/**
 * Envía el pedido por WhatsApp con validación visual
 */
function enviarPedidoWhatsApp() {
    // Validar que haya items en el carrito
    if (carrito.length === 0) {
        return mostrarNotificacion('El carrito está vacío', 'warning');
    }

    // Validar formulario visualmente
    const formularioValido = validarFormularioVisual();
    
    if (!formularioValido) {
        mostrarNotificacion('Por favor completa correctamente todos los campos', 'warning');
        return;
    }

    // Obtener datos del formulario
    const datosCliente = {
        nombre: document.getElementById('customer-name').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        direccion: document.getElementById('customer-address').value.trim(),
        zona: document.getElementById('delivery-zone').value,
        fecha: document.getElementById('delivery-date').value,
        hora: document.getElementById('delivery-time').value
    };

    // Validar restricciones de items
    const erroresCarrito = validarCarrito(carrito);
    if (erroresCarrito.length > 0) {
        alert('⚠️ No se puede enviar el pedido:\n\n' + erroresCarrito.join('\n'));
        return;
    }

    // Construir y enviar mensaje
    const mensaje = construirMensajeWhatsApp(carrito, datosCliente);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
    mostrarNotificacion('Pedido enviado a WhatsApp ✅', 'success');
}

/**
 * Valida restricciones de cada ítem del carrito
 */
function validarCarrito(carrito) {
    const errores = [];

    carrito.forEach(item => {
        const min = item.cantidad_minima || 1;
        const max = item.cantidad_maxima;

        if (item.cantidad < min) {
            errores.push(`⚠️ ${item.nombre}: mínimo ${min} unidades (tienes ${item.cantidad})`);
        }

        if (max && item.cantidad > max) {
            errores.push(`⚠️ ${item.nombre}: máximo ${max} unidades (tienes ${item.cantidad})`);
        }
    });

    return errores;
}

function construirMensajeWhatsApp(carrito, datosCliente) {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    
    // Mensaje estructurado con formato legible y procesable
    let mensaje = '  *NUEVO PEDIDO - ARTESANAL COCINA  *\n';
    mensaje += '═════════════════════════════\n\n';
    
    // DATOS DEL CLIENTE (formato clave:valor para fácil procesamiento)
    mensaje += '📋 *DATOS DEL CLIENTE*\n';
    mensaje += '─────────────────────────────\n';
    mensaje += `👤 Nombre: ${datosCliente.nombre}\n`;
    mensaje += `📧 Email: ${datosCliente.email}\n`;
    mensaje += `📍 Dirección: ${datosCliente.direccion}\n`;
    mensaje += `🗺️ Zona: ${datosCliente.zona}\n`;
    mensaje += `📅 Fecha entrega: ${datosCliente.fecha}\n`;
    mensaje += `🕐 Hora entrega: ${datosCliente.hora}\n\n`;
    
    // ITEMS DEL PEDIDO
    mensaje += '🛒 *ITEMS DEL PEDIDO*\n';
    mensaje += '─────────────────────────────\n';
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `${index + 1}. ${item.nombre}\n`;
        mensaje += `   • Cantidad: ${item.cantidad}\n`;
        mensaje += `   • Precio unitario: $${item.precio.toLocaleString('es-CO')}\n`;
        mensaje += `   • Subtotal: $${subtotal.toLocaleString('es-CO')}\n\n`;
    });
    
    // TOTAL
    mensaje += '═════════════════════════════\n';
    mensaje += `💰 *TOTAL A PAGAR: $${total.toLocaleString('es-CO')}*\n`;
    mensaje += '═════════════════════════════\n\n';
    
    return mensaje;
}

/**
 * Muestra una notificación temporal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error, info, warning)
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-20 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(400px)';
        setTimeout(() => notificacion.remove(), 300);
    }, 2500);
}

// Agregar estilos para la animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease;
        transition: all 0.3s ease;
    }
    
    .cantidad-control {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cantidad-btn {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
    }
`;
document.head.appendChild(style);

// Establecer fecha mínima como hoy al cargar
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
    
    const fechaInput = document.getElementById('delivery-date');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', hoy);
        fechaInput.setAttribute('max', '2026-01-01');
    }

    setTimeout(inicializarValidacion, 100);
});