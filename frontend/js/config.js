// =====================================================================
// CONFIGURACIÓN DEL FRONTEND (un solo lugar)
// Taller 2: datos de ejemplo en frontend/data/*.json
// Taller 3: USAR_DATOS_EJEMPLO = false y API_URL = dirección del gateway
// =====================================================================
const CONFIG = {
  USAR_DATOS_EJEMPLO: true,
  API_URL: 'http://localhost', // Taller 3: la dirección del gateway Apache
};

// Tabla de permisos del Taller 1: quién crea, modifica y elimina cada entidad.
// Consultar (GET) lo puede hacer cualquier usuario autenticado.
const PERMISOS = {
  usuarios: ['administrador'],
  productos: ['administrador', 'produccion'],
  clientes: ['administrador', 'comercial'],
  pedidos: ['administrador', 'comercial'],
  lotes: ['administrador', 'produccion'],
};

// Mapa de navegación del Taller 1: menú y página de inicio de cada rol
const MENU_POR_ROL = {
  administrador: [
    { texto: 'Panel general', pagina: 'inicio.html' },
    { texto: 'Usuarios', pagina: 'usuarios.html' },
    { texto: 'Productos', pagina: 'productos.html' },
    { texto: 'Clientes', pagina: 'clientes.html' },
    { texto: 'Pedidos', pagina: 'pedidos.html' },
    { texto: 'Lotes', pagina: 'lotes.html' },
  ],
  comercial: [
    { texto: 'Pedidos', pagina: 'pedidos.html' },
    { texto: 'Clientes', pagina: 'clientes.html' },
    { texto: 'Productos', pagina: 'productos.html' },
    { texto: 'Lotes', pagina: 'lotes.html' },
  ],
  produccion: [
    { texto: 'Lotes', pagina: 'lotes.html' },
    { texto: 'Productos', pagina: 'productos.html' },
    { texto: 'Clientes', pagina: 'clientes.html' },
    { texto: 'Pedidos', pagina: 'pedidos.html' },
  ],
};
