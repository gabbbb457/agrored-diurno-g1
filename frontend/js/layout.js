// =====================================================================
// ESTRUCTURA COMÚN: encabezado con nombre y rol, menú según el rol y
// botón de cerrar sesión. Cada página tiene <header id="encabezado">.
// =====================================================================
function pintarEncabezado(paginaActual) {
  const sesion = Sesion.exigir();
  if (!sesion) return;
  const enlaces = MENU_POR_ROL[sesion.rol]
    .map((item) => `<a href="${item.pagina}" class="${item.pagina === paginaActual ? 'activo' : ''}">${item.texto}</a>`)
    .join('');

  document.getElementById('encabezado').innerHTML = `
    <div class="barra">
      <a class="marca" href="${Sesion.paginaDeInicio(sesion.rol)}">AgroRed</a>
      <button class="boton-menu" aria-label="Abrir menú" onclick="document.body.classList.toggle('menu-abierto')">☰</button>
      <div class="usuario">
        <span>${sesion.nombre}</span>
        <span class="etiqueta-rol">${sesion.rol}</span>
        <button class="boton secundario" onclick="Sesion.cerrar()">Cerrar sesión</button>
      </div>
    </div>
    <nav class="menu">${enlaces}</nav>`;
  return sesion;
}

// Evita que textos con < o > rompan la tabla
function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
