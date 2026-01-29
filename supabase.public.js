// Configuración pública de Supabase (SEGURA para navegador)
// Usa SOLO la anon/public key (Project Settings → API → anon public)
// NO uses service_role en frontend.
//
// Nota: la anon key es “pública”, pero scanners (GitGuardian) la detectan como JWT.
// Por eso este repo NO la incluye por defecto.

window.SUPABASE_PUBLIC = {
  url: 'https://slbzwylbnzzarrxejpql.supabase.co',
  // Opciones para entregar la key sin subirla al repo:
  // 1) Enviar el link del trabajador con ?k=ANON_KEY (worker.js la guarda en localStorage)
  // 2) Configurar Supabase desde la UI de sincronización (si aplica)
  anonKey: ''
};
