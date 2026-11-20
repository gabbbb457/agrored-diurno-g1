// =====================================================================
// Pantalla de lotes: listar, crear, editar y eliminar.
// =====================================================================
const ROLES_QUE_ESCRIBEN = ['administrador', 'produccion'];

function obtenerSesion() {
  const s = Sesion.leer() || {};
  return { token: s.token, rol: s.rol, nombre: s.nombre || (s.usuario && s.usuario.nombre) };
}
function cerrarSesion() { Sesion.cerrar(); }
async function api(ruta, opciones = {}) {
  const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
  return pedirApi(opciones.method || 'GET', ruta, cuerpo);
}

const sesion = obtenerSesion();
if (!sesion.token) cerrarSesion();
const puedeEscribir = ROLES_QUE_ESCRIBEN.includes(sesion.rol);

const el = {
  usuario: document.getElementById('usuario'),
  salir: document.getElementById('btn-salir'),
  aviso: document.getElementById('aviso'),
  filtro: document.getElementById('filtro'),
  nuevo: document.getElementById('btn-nuevo'),
  tabla: document.getElementById('tabla-lotes'),
  vacio: document.getElementById('vacio'),
  dialogo: document.getElementById('dialogo'),
  form: document.getElementById('formulario'),
  tituloForm: document.getElementById('titulo-form'),
  erroresForm: document.getElementById('errores-form'),
  cancelar: document.getElementById('btn-cancelar'),
  codigo: document.getElementById('codigo_lote'),
  producto: document.getElementById('producto_id'),
  fecha: document.getElementById('fecha_produccion'),
  cantidad: document.getElementById('cantidad'),
  calidad: document.getElementById('resultado_calidad'),
};

let idEnEdicion = null;

function mostrar(caja, mensaje, detalles = []) {
  caja.textContent = [mensaje, ...detalles].join(' · ');
  caja.hidden = false;
}

function ocultar(caja) {
  caja.hidden = true;
  caja.textContent = '';
}

function manejarError(error, caja = el.aviso) {
  if (error.status === 401) {
    mostrar(caja, 'Tu sesión venció. Vuelve a iniciar sesión.');
    setTimeout(cerrarSesion, 1500);
  } else if (error.status === 403) {
    mostrar(caja, 'Tu rol no tiene permiso para hacer esta acción.');
  } else if (error.status === 409) {
    mostrar(caja, error.message || 'Ya existe un lote con ese código.');
  } else if (error.status === 400) {
    mostrar(caja, error.message || 'Datos inválidos.', error.detalles);
  } else if (error.status === 503) {
    mostrar(caja, 'Un servicio necesario no está disponible. Intenta más tarde.');
  } else {
    mostrar(caja, error.message || 'No se pudo completar la operación.');
  }
}

function crearCelda(texto, clase) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (clase) td.className = clase;
  return td;
}

function crearBoton(texto, clase, alHacerClic) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.className = clase;
  b.addEventListener('click', alHacerClic);
  return b;
}

function dibujarFila(lote) {
  const tr = document.createElement('tr');
  tr.appendChild(crearCelda(lote.codigo_lote));
  tr.appendChild(crearCelda(lote.producto ? lote.producto.nombre : `Producto ${lote.producto_id} (sin datos)`));
  tr.appendChild(crearCelda(lote.fecha_produccion));
  tr.appendChild(crearCelda(lote.cantidad, 'num'));

  const calidad = document.createElement('td');
  const etiqueta = document.createElement('span');
  const claseEstado = lote.resultado_calidad === 'aprobado' ? 'activo' : (lote.resultado_calidad === 'rechazado' ? 'inactivo' : '');
  etiqueta.className = `estado ${claseEstado}`;
  etiqueta.textContent = lote.resultado_calidad;
  calidad.appendChild(etiqueta);
  tr.appendChild(calidad);

  const acciones = document.createElement('td');
  acciones.className = 'nowrap';
  if (puedeEscribir) {
    acciones.appendChild(crearBoton('Editar', 'boton pequeno secundario', () => abrirFormulario(lote)));
    acciones.appendChild(crearBoton('Eliminar', 'boton pequeno peligro', () => eliminar(lote)));
  }
  tr.appendChild(acciones);
  return tr;
}

async function cargar() {
  ocultar(el.aviso);
  try {
    const consulta = el.filtro.value ? `?resultado_calidad=${encodeURIComponent(el.filtro.value)}` : '';
    const lotes = await api(`/lotes${consulta}`);
    if (!lotes) return;
    el.tabla.replaceChildren(...lotes.map(dibujarFila));
    el.vacio.hidden = lotes.length > 0;
    if (lotes.some((l) => l.aviso)) {
      mostrar(el.aviso, 'Algunos datos del producto no están disponibles por ahora.');
    }
  } catch (error) {
    manejarError(error);
  }
}

async function llenarProductos() {
  try {
    const productos = await api('/productos');
    if (!productos) return;
    el.producto.replaceChildren(...productos.map((p) => {
      const o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.nombre;
      return o;
    }));
  } catch (error) {
    manejarError(error);
  }
}

function abrirFormulario(lote) {
  ocultar(el.erroresForm);
  idEnEdicion = lote ? lote.id : null;
  el.tituloForm.textContent = lote ? 'Editar lote' : 'Nuevo lote';
  el.codigo.value = lote ? lote.codigo_lote : '';
  el.producto.value = lote ? lote.producto_id : el.producto.options[0]?.value || '';
  el.fecha.value = lote ? lote.fecha_produccion : '';
  el.cantidad.value = lote ? lote.cantidad : '';
  el.calidad.value = lote ? lote.resultado_calidad : 'pendiente';
  el.dialogo.classList.add('abierta');
}

function cerrarFormulario() {
  el.dialogo.classList.remove('abierta');
}

async function guardar(evento) {
  evento.preventDefault();
  ocultar(el.erroresForm);
  const datos = {
    codigo_lote: el.codigo.value.trim(),
    producto_id: Number(el.producto.value),
    fecha_produccion: el.fecha.value,
    cantidad: Number(el.cantidad.value),
    resultado_calidad: el.calidad.value,
  };
  try {
    if (idEnEdicion === null) {
      await api('/lotes', { method: 'POST', body: JSON.stringify(datos) });
    } else {
      await api(`/lotes/${idEnEdicion}`, { method: 'PUT', body: JSON.stringify(datos) });
    }
    cerrarFormulario();
    await cargar();
  } catch (error) {
    manejarError(error, el.erroresForm);
  }
}

async function eliminar(lote) {
  if (!confirm(`¿Eliminar el lote ${lote.codigo_lote}?`)) return;
  try {
    await api(`/lotes/${lote.id}`, { method: 'DELETE' });
    await cargar();
  } catch (error) {
    manejarError(error);
  }
}

if (el.usuario) el.usuario.textContent = `${sesion.nombre} · ${sesion.rol}`;
el.nuevo.hidden = !puedeEscribir;

if (el.salir) el.salir.addEventListener('click', cerrarSesion);
el.filtro.addEventListener('change', cargar);
el.nuevo.addEventListener('click', () => abrirFormulario(null));
el.cancelar.addEventListener('click', cerrarFormulario);
el.form.addEventListener('submit', guardar);

llenarProductos().then(cargar);
