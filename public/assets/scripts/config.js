// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
// ⚠️ IMPORTANTE: Reemplaza estas credenciales con las tuyas
// Encuéntralas en: Supabase → Settings → API

const CONFIG = {
    // URL de tu proyecto Supabase
    SUPABASE_URL: 'https://sxojkdrkouhokhylnkjj.supabase.co',
    
    // Clave pública (anon key)
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2prZHJrb3Vob2toeWxua2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTc3MzEsImV4cCI6MjA3OTY3MzczMX0.srF5x5H-XNsNHhquf6kGtShBS6hpArAUW6clm9V7wto',
    
    WHATSAPP_NUMBER: '573107573527',
    
    // Mensaje por defecto de WhatsApp
    WHATSAPP_DEFAULT_MESSAGE: 'Hola! Quiero hacer un pedido',
    
    // Configuración de la galería
    GALLERY_LIMIT: 50, // Número máximo de fotos a cargar
    
    // Activar modo debug (muestra información en consola)
    DEBUG_MODE: true
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