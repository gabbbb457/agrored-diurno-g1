// =====================================================================
// SESIÓN: quién entró y con qué rol (y su token en el Taller 3)
// Se guarda en sessionStorage: se borra al cerrar la pestaña.
// =====================================================================
const Sesion = {
  guardar(datos) {
    sessionStorage.setItem('sesion', JSON.stringify(datos));
  },
  leer() {
    try {
      return JSON.parse(sessionStorage.getItem('sesion'));
    } catch (e) {
      return null;
    }
  },
  token() {
    const s = Sesion.leer();
    return s ? s.token : null;
  },
  cerrar() {
    sessionStorage.removeItem('sesion');
    sessionStorage.removeItem('datos');
    window.location.href = 'index.html';
  },
  // Cada página protegida la llama al cargar: sin sesión, vuelve al login
  exigir() {
    const s = Sesion.leer();
    if (!s) window.location.href = 'index.html';
    return s;
  },
  puedeEditar(entidad) {
    const s = Sesion.leer();
    return !!s && PERMISOS[entidad].includes(s.rol);
  },
  paginaDeInicio(rol) {
    return MENU_POR_ROL[rol][0].pagina;
  },
};
