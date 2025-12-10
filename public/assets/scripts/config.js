// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================


const CONFIG = {
    // URL de tu proyecto Supabase
    SUPABASE_URL: 'https://sxojkdrkouhokhylnkjj.supabase.co',
    
    // Clave pública (anon key)
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2prZHJrb3Vob2toeWxua2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTc3MzEsImV4cCI6MjA3OTY3MzczMX0.srF5x5H-XNsNHhquf6kGtShBS6hpArAUW6clm9V7wto',
    
    WHATSAPP_NUMBER: '573107573527',
    
    // Configuración de la galería
    GALLERY_LIMIT: 50, // Número máximo de fotos a cargar
    
    // Activar modo debug (muestra información en consola)
    DEBUG_MODE: true,

        // Información de métodos de pago
    METODOS_PAGO: {
        transferencia: {
            activo: true,
            banco: 'Bancolombia',
            numeroCuenta: '1234567890',
            tipoCuenta: 'Ahorros',
            titular: 'Liyen Alpala'
        },
        nequi: {
            activo: true,
            numero: '3107573527'
        },

        // Puedes agregar más métodos
        bancolombia: {
            activo: true,
            numero: '3107573527'
        }
    },

        // Zonas de entrega disponibles
    ZONAS_ENTREGA: [
        'Norte',
        'Sur',
        'Este',
        'Oeste',
        'Centro'
    ],
    
    // Mensaje de bienvenida personalizado
    MENSAJE_BIENVENIDA: '¡Hola! Gracias por tu pedido 😊',
    
    // Instrucciones adicionales
    INSTRUCCIONES_PAGO: 'Una vez realizado el pago, envíanos el comprobante para procesar tu pedido.'
};

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(
    CONFIG.SUPABASE_URL, 
    CONFIG.SUPABASE_KEY
);

// Función de debug
function debug(mensaje, datos = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`🔍 [DEBUG] ${mensaje}`, datos || '');
    }
}

// Verificar configuración al cargar
if (CONFIG.SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
    console.warn('⚠️ ATENCIÓN: Debes configurar tus credenciales de Supabase en config.js');
}




/**
 * Genera el texto de métodos de pago activos
 * @returns {string} Texto formateado con los métodos de pago
 */
function generarTextoMetodosPago() {
    let texto = '';
    const metodos = CONFIG.METODOS_PAGO;
    
    if (metodos.transferencia.activo) {
        texto += '🏦 *Transferencia Bancaria*\n';
        texto += `   Banco: ${metodos.transferencia.banco}\n`;
        texto += `   Tipo: ${metodos.transferencia.tipoCuenta}\n`;
        texto += `   Cuenta: ${metodos.transferencia.numeroCuenta}\n`;
        texto += `   Titular: ${metodos.transferencia.titular}\n\n`;
    }
    
    if (metodos.nequi.activo) {
        texto += '💸 *Nequi*\n';
        texto += `   Número: ${metodos.nequi.numero}\n\n`;
    }
    
    if (metodos.daviplata.activo) {
        texto += '💳 *Daviplata*\n';
        texto += `   Número: ${metodos.daviplata.numero}\n\n`;
    }
    
    if (metodos.bancolombia.activo) {
        texto += '🔵 *Bancolombia a la Mano*\n';
        texto += `   Número: ${metodos.bancolombia.numero}\n\n`;
    }
    
    return texto;
}