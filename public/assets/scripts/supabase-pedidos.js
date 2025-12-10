// ==========================================
// CONEXIÓN SEGURA A SUPABASE - PEDIDOS
// ==========================================

/**
 * Guarda el pedido en Supabase
 * @param {Object} datosCliente - Datos del cliente y entrega
 * @param {Array} itemsCarrito - Items del carrito
 * @returns {Promise<Object>} Resultado de la operación
 */
async function guardarPedidoEnSupabase(datosCliente, itemsCarrito) {
    try {
        debug('📤 Iniciando guardado de pedido en Supabase...');
        
        // Validar que haya items
        if (!itemsCarrito || itemsCarrito.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Calcular el total
        const total = itemsCarrito.reduce((sum, item) => 
            sum + (item.precio * item.cantidad), 0
        );

        // Construir el detalle del pedido
        const detallePedido = construirDetallePedido(itemsCarrito);

        // Preparar los datos para Supabase
        const pedidoData = {
            cliente_nombre: datosCliente.nombre,
            cliente_telefono: datosCliente.telefono || null,
            cliente_correo: datosCliente.email,
            cliente_direccion: datosCliente.direccion,
            cliente_zona: datosCliente.zona,
            fecha_entrega: datosCliente.fecha,
            hora_entrega: datosCliente.hora,
            total_pedido: total,
            detalle_pedido: detallePedido,
            estado: 'pendiente',
            fuente: 'web'
        };

        debug('📋 Datos del pedido:', pedidoData);

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('pedidos')
            .insert([pedidoData])
            .select()
            .single();

        if (error) {
            console.error('❌ Error al guardar en Supabase:', error);
            throw error;
        }

        debug('✅ Pedido guardado exitosamente:', data);

        return {
            success: true,
            pedido: data,
            mensaje: 'Pedido guardado correctamente'
        };

    } catch (error) {
        console.error('❌ Error en guardarPedidoEnSupabase:', error);
        return {
            success: false,
            error: error.message,
            mensaje: 'Error al guardar el pedido'
        };
    }
}

/**
 * Construye el detalle del pedido en formato texto
 * @param {Array} items - Items del carrito
 * @returns {string} Detalle formateado
 */
function construirDetallePedido(items) {
    return items.map(item => 
        `${item.cantidad}x ${item.nombre}`
    ).join('\n');
}

/**
 * Verifica la conexión con Supabase
 * @returns {Promise<boolean>}
 */
async function verificarConexionSupabase() {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Error de conexión con Supabase:', error);
            return false;
        }

        debug('✅ Conexión con Supabase establecida');
        return true;
    } catch (error) {
        console.error('❌ Error al verificar conexión:', error);
        return false;
    }
}

/**
 * Obtiene un pedido por ID
 * @param {string} pedidoId - UUID del pedido
 * @returns {Promise<Object>}
 */
async function obtenerPedidoPorId(pedidoId) {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('id', pedidoId)
            .single();

        if (error) throw error;

        return { success: true, pedido: data };
    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza el estado de un pedido
 * @param {string} pedidoId - UUID del pedido
 * @param {string} nuevoEstado - Nuevo estado del pedido
 * @returns {Promise<Object>}
 */
async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .update({ estado: nuevoEstado })
            .eq('id', pedidoId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, pedido: data };
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene los pedidos del cliente por email
 * @param {string} email - Email del cliente
 * @returns {Promise<Array>}
 */
async function obtenerPedidosCliente(email) {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('cliente_correo', email)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, pedidos: data };
    } catch (error) {
        console.error('❌ Error al obtener pedidos del cliente:', error);
        return { success: false, error: error.message, pedidos: [] };
    }
}

/**
 * FUNCIÓN PRINCIPAL: Procesa y envía el pedido
 * Esta función reemplaza la función enviarPedidoWhatsApp existente
 */
async function procesarYEnviarPedido() {
    try {
        // 1. Validar que haya items en el carrito
        if (carrito.length === 0) {
            return mostrarNotificacion('El carrito está vacío', 'warning');
        }

        // 2. Validar formulario visualmente
        const formularioValido = validarFormularioVisual();
        
        if (!formularioValido) {
            mostrarNotificacion('Por favor completa correctamente todos los campos', 'warning');
            return;
        }

        // 3. Obtener datos del formulario
        const datosCliente = {
            nombre: document.getElementById('customer-name').value.trim(),
            telefono: document.getElementById('customer-phone')?.value.trim() || null,
            email: document.getElementById('customer-email').value.trim(),
            direccion: document.getElementById('customer-address').value.trim(),
            zona: document.getElementById('delivery-zone').value,
            fecha: document.getElementById('delivery-date').value,
            hora: document.getElementById('delivery-time').value
        };

        // 4. Validar restricciones de items
        const erroresCarrito = validarCarrito(carrito);
        if (erroresCarrito.length > 0) {
            alert('⚠️ No se puede enviar el pedido:\n\n' + erroresCarrito.join('\n'));
            return;
        }

        // 5. Mostrar loading
        const btnEnviar = document.querySelector('[onclick="procesarYEnviarPedido()"]');
        const textoOriginal = btnEnviar ? btnEnviar.textContent : '';
        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<span class="loading loading-spinner"></span> Procesando...';
        }

        // 6. Guardar en Supabase
        const resultado = await guardarPedidoEnSupabase(datosCliente, carrito);

        if (!resultado.success) {
            throw new Error(resultado.mensaje);
        }

        // 7. Construir mensaje de WhatsApp
        const mensaje = construirMensajeWhatsApp(carrito, datosCliente);
        const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

        // 8. Abrir WhatsApp
        window.open(url, '_blank');

        // 9. Mostrar confirmación
        mostrarNotificacion('✅ Pedido guardado y enviado a WhatsApp', 'success');

        // 10. Opcional: Limpiar el carrito después de 2 segundos
        setTimeout(() => {
                vaciarCarrito();
                cerrarCarrito();
                
                // Limpiar formulario
                document.getElementById('customer-name').value = '';
                document.getElementById('customer-email').value = '';
                document.getElementById('customer-address').value = '';
                if (document.getElementById('customer-phone')) {
                    document.getElementById('customer-phone').value = '';
                }
            
        }, 2000);

        // 11. Restaurar botón
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = textoOriginal;
        }

    } catch (error) {
        console.error('❌ Error al procesar pedido:', error);
        mostrarNotificacion('Error al procesar el pedido: ' + error.message, 'error');
        
        // Restaurar botón
        const btnEnviar = document.querySelector('[onclick="procesarYEnviarPedido()"]');
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Pedido por WhatsApp';
        }
    }
}

/**
 * Suscribirse a cambios en tiempo real de pedidos (opcional)
 * Útil para actualizar la UI cuando hay cambios
 */
function suscribirseACambiosPedidos(email, callback) {
    const subscription = supabase
        .channel('pedidos-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'pedidos',
                filter: `cliente_correo=eq.${email}`
            },
            (payload) => {
                debug('📬 Cambio detectado en pedido:', payload);
                if (callback) callback(payload);
            }
        )
        .subscribe();

    return subscription;
}

/**
 * Exportar pedido a JSON (útil para respaldo)
 * @param {string} pedidoId - UUID del pedido
 * @returns {Promise<void>}
 */
async function exportarPedidoJSON(pedidoId) {
    try {
        const resultado = await obtenerPedidoPorId(pedidoId);
        
        if (resultado.success) {
            const dataStr = JSON.stringify(resultado.pedido, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `pedido-${pedidoId}.json`;
            link.click();
            
            mostrarNotificacion('Pedido exportado correctamente', 'success');
        }
    } catch (error) {
        console.error('❌ Error al exportar pedido:', error);
        mostrarNotificacion('Error al exportar pedido', 'error');
    }
}

// ==========================================
// INICIALIZACIÓN Y VERIFICACIÓN
// ==========================================

// Verificar conexión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    debug('🚀 Inicializando conexión con Supabase...');
    
    const conexionOk = await verificarConexionSupabase();
    
    if (!conexionOk) {
        console.warn('⚠️ No se pudo establecer conexión con Supabase');
        // Opcional: Mostrar mensaje al usuario
        // mostrarNotificacion('Modo sin conexión activado', 'info');
    } else {
        debug('✅ Sistema listo para recibir pedidos');
    }
});

// ==========================================
// UTILIDADES ADICIONALES
// ==========================================

/**
 * Formatea la fecha para mostrar al usuario
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string}
 */
function formatearFecha(fecha) {
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(fecha).toLocaleDateString('es-CO', opciones);
}

/**
 * Obtiene estadísticas básicas de pedidos (para uso futuro)
 * @returns {Promise<Object>}
 */
async function obtenerEstadisticasPedidos() {
    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('estado, total_pedido');

        if (error) throw error;

        const stats = {
            total: data.length,
            totalVentas: data.reduce((sum, p) => sum + p.total_pedido, 0),
            porEstado: {}
        };

        data.forEach(pedido => {
            stats.porEstado[pedido.estado] = (stats.porEstado[pedido.estado] || 0) + 1;
        });

        return { success: true, estadisticas: stats };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return { success: false, error: error.message };
    }
}

// Exportar funciones para uso global
window.guardarPedidoEnSupabase = guardarPedidoEnSupabase;
window.procesarYEnviarPedido = procesarYEnviarPedido;
window.obtenerPedidoPorId = obtenerPedidoPorId;
window.actualizarEstadoPedido = actualizarEstadoPedido;
window.obtenerPedidosCliente = obtenerPedidosCliente;
window.verificarConexionSupabase = verificarConexionSupabase;

debug('📦 Módulo de Supabase cargado correctamente');