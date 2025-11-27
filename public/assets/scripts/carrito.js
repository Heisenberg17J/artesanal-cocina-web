// ==========================================
// SISTEMA DE CARRITO DE COMPRAS
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
    // Verificar si el plato ya está en el carrito
    const index = carrito.findIndex(item => item.id === plato.id);
    
    if (index !== -1) {
        // Si ya existe, incrementar cantidad
        carrito[index].cantidad++;
    } else {
        // Si no existe, agregarlo con cantidad 1
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
    
    // Actualizar el botón del plato
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
        actualizarBotonesPlato(platoId); // ⭐ AÑADIDO
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
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
            guardarCarrito();
            actualizarBotonesPlato(platoId); // ⭐ AÑADIDO
            renderizarCarrito();
        } else {
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
        
        // Actualizar todos los botones de platos
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
    
    // Buscar el botón de agregar
    const btnAgregar = document.querySelector(`[data-plato-id="${platoId}"][data-action="add"]`);
    
    // Buscar el contenedor de controles (que tiene data-action="remove")
    const controlesContainer = document.querySelector(`[data-plato-id="${platoId}"][data-action="remove"]`);
    
    // Buscar el span de cantidad dentro de las tarjetas
    const cantidadSpan = document.querySelector(`[data-plato-cantidad="${platoId}"]`);
    
    if (cantidad > 0) {
        // Hay items en el carrito
        if (btnAgregar) {
            btnAgregar.classList.add('hidden');
        }
        if (controlesContainer) {
            controlesContainer.classList.remove('hidden');
        }
        if (cantidadSpan) {
            cantidadSpan.textContent = cantidad;
        }
    } else {
        // No hay items en el carrito
        if (btnAgregar) {
            btnAgregar.classList.remove('hidden');
        }
        if (controlesContainer) {
            controlesContainer.classList.add('hidden');
        }
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
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    
    // Renderizar items
    container.innerHTML = '';
    carrito.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex gap-4 bg-base-200 rounded-lg p-4';
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
 * Envía el pedido por WhatsApp
 */
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'warning');
        return;
    }
    
    // Construir mensaje
    let mensaje = '🍽️ *MI PEDIDO*\n\n';
    
    carrito.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.nombre}\n`;
        mensaje += `  $${item.precio.toLocaleString('es-CO')} c/u = $${(item.precio * item.cantidad).toLocaleString('es-CO')}\n\n`;
    });
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    mensaje += `💰 *TOTAL: $${total.toLocaleString('es-CO')}*\n\n`;
    mensaje += '¡Gracias por tu pedido! 😊';
    
    // Codificar y enviar
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
    
    window.open(url, '_blank');
    
    // Opcional: vaciar carrito después de enviar
    // vaciarCarrito();
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
`;
document.head.appendChild(style);

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
});