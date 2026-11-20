// =====================================================================
// PANTALLA DE CLIENTES (responsable: Miguel Ángel Vanegas · ms-clientes)
// Lista, filtra por ciudad, crea, edita y elimina clientes.
// Los botones de crear, editar y eliminar solo aparecen para los roles
// con permiso (administrador y comercial). produccion solo consulta.
// =====================================================================
pintarEncabezado('clientes.html');
const PUEDE_EDITAR = Sesion.puedeEditar('clientes');

let clientes = [];    
let idEditando = null;   

const tabla = document.getElementById('cuerpo-tabla');
const filtro = document.getElementById('filtro-ciudad');
const ventana = document.getElementById('ventana');
const formulario = document.getElementById('formulario');
const errores = document.getElementById('errores');

// Arranque
if (PUEDE_EDITAR) {
  document.getElementById('zona-nuevo').innerHTML = '<button class="boton" id="nuevo">+ Nuevo cliente</button>';
  document.getElementById('nuevo').addEventListener('click', () => abrirFormulario(null));
} else {
  document.getElementById('th-acciones').remove();
  document.getElementById('subtitulo').textContent += ' · solo consulta para tu rol';
}
filtro.addEventListener('change', pintarTabla);
document.getElementById('cancelar').addEventListener('click', cerrarFormulario);
formulario.addEventListener('submit', guardar);
cargar();

async function cargar() {
  try {
    clientes = await Api.listar('clientes'); // una sola petición: GET /api/clientes
  } catch (error) {
    // Por ejemplo 503 si ms-clientes está detenido: la pantalla avisa y no se cae
    clientes = [];
    tabla.innerHTML = `<tr><td class="vacio error" colspan="7">${escapar(error.message)}</td></tr>`;
    return;
  }
  pintarFiltroCiudades();
  pintarTabla();
}

// ---- Lista
function pintarFiltroCiudades() {
  const elegida = filtro.value;
  const ciudades = [...new Set(clientes.map((c) => c.ciudad))].sort();
  filtro.innerHTML = '<option value="">Todas</option>' +
    ciudades.map((c) => `<option ${c === elegida ? 'selected' : ''}>${escapar(c)}</option>`).join('');
}

function pintarTabla() {
  const visibles = clientes.filter((c) => !filtro.value || c.ciudad === filtro.value);
  if (visibles.length === 0) {
    tabla.innerHTML = '<tr><td class="vacio" colspan="7">No hay clientes para mostrar</td></tr>';
    return;
  }
  tabla.innerHTML = visibles.map((c) => `
    <tr>
      <td data-titulo="Nombre">${escapar(c.nombre)}</td>
      <td data-titulo="NIT" class="nowrap">${escapar(c.nit)}</td>
      <td data-titulo="Email">${escapar(c.email)}</td>
      <td data-titulo="Teléfono">${escapar(c.telefono)}</td>
      <td data-titulo="Ciudad">${escapar(c.ciudad)}</td>
      <td data-titulo="Estado"><span class="estado ${c.activo ? 'activo' : 'inactivo'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
      ${PUEDE_EDITAR ? `
      <td data-titulo="Acciones" class="nowrap">
        <button class="boton pequeno" onclick="abrirFormulario(${c.id})">Editar</button>
        <button class="boton pequeno peligro" onclick="eliminar(${c.id})">Eliminar</button>
      </td>` : ''}
    </tr>`).join('');
}

// ---- Formulario (crear y editar)
function abrirFormulario(id) {
  idEditando = id;
  const c = clientes.find((x) => x.id === id) || { nombre: '', nit: '', email: '', telefono: '', ciudad: '', activo: true };
  document.getElementById('titulo-formulario').textContent = id ? 'Editar cliente' : 'Nuevo cliente';
  for (const campo of ['nombre', 'nit', 'email', 'telefono', 'ciudad']) {
    document.getElementById(campo).value = c[campo];
  }
  document.getElementById('activo').checked = c.activo;
  errores.textContent = '';
  ventana.classList.add('abierta');
}

function cerrarFormulario() {
  ventana.classList.remove('abierta');
}

function leerFormulario() {
  return {
    nombre: document.getElementById('nombre').value.trim(),
    nit: document.getElementById('nit').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    telefono: document.getElementById('telefono').value.trim(),
    ciudad: document.getElementById('ciudad').value.trim(),
    activo: document.getElementById('activo').checked,
  };
}

// Las mismas reglas del modelo y del servicio de ms-clientes,
// para avisar antes de enviar. La API las vuelve a validar.
function validar(datos) {
  const lista = [];
  if (!datos.nombre) lista.push('El nombre es obligatorio');
  if (!/^\d{9}-\d$/.test(datos.nit)) lista.push('El NIT debe tener el formato 900123456-1');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) lista.push('El email no es válido');
  if (!datos.telefono) lista.push('El teléfono es obligatorio');
  if (!datos.ciudad) lista.push('La ciudad es obligatoria');
  const repetido = clientes.find((c) => c.nit === datos.nit && c.id !== idEditando);
  if (repetido) lista.push(`Ya existe un cliente con el NIT ${datos.nit} (${repetido.nombre})`);
  return lista;
}

async function guardar(evento) {
  evento.preventDefault();
  const datos = leerFormulario();
  const problemas = validar(datos);
  if (problemas.length > 0) {
    errores.innerHTML = problemas.map(escapar).join('<br>');
    return;
  }
  try {
    if (idEditando) {
      const actual = clientes.find((c) => c.id === idEditando);
      await Api.actualizar('clientes', idEditando, { ...datos, fecha_registro: actual.fecha_registro });
    } else {
      await Api.crear('clientes', { ...datos, fecha_registro: new Date().toISOString().slice(0, 10) });
    }
    cerrarFormulario();
    await cargar();
  } catch (error) {
    errores.textContent = error.message; // por ejemplo el 409 del NIT repetido que responde la API
  }
}

// ---- Eliminar
async function eliminar(id) {
  const c = clientes.find((x) => x.id === id);
  if (!confirm(`¿Eliminar el cliente "${c.nombre}"?`)) return;
  try {
    await Api.eliminar('clientes', id);
    await cargar();
  } catch (error) {
    alert(error.message); // por ejemplo el 403 o el 503 que responde la API
  }
}
// =====================================================================
// Pantalla de lotes: listar, crear, editar y eliminar.
// Solo habla con la API a través de "api" (js/api.js).
// =====================================================================
const ROLES_QUE_ESCRIBEN = ['administrador', 'produccion'];

const sesion = obtenerSesion();
if (!sesion.token) cerrarSesion(); // sin sesión: de vuelta al inicio de sesión
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

let idEnEdicion = null; // null = creando; número = editando ese lote

// ---------- Mensajes ----------
function mostrar(caja, mensaje, detalles = []) {
  caja.textContent = [mensaje, ...detalles].join(' · ');
  caja.hidden = false;
}

function ocultar(caja) {
  caja.hidden = true;
  caja.textContent = '';
}

// Traduce el código de estado a un mensaje claro para la persona
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

// ---------- Lista ----------
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
  // El nombre del producto lo compone el backend: no se pide a ms-productos desde aquí.
  tr.appendChild(crearCelda(lote.producto ? lote.producto.nombre : `Producto ${lote.producto_id} (sin datos)`));
  tr.appendChild(crearCelda(lote.fecha_produccion));
  tr.appendChild(crearCelda(lote.cantidad, 'num'));

  const calidad = document.createElement('td');
  const etiqueta = document.createElement('span');
  etiqueta.className = `etiqueta ${lote.resultado_calidad}`;
  etiqueta.textContent = lote.resultado_calidad;
  calidad.appendChild(etiqueta);
  tr.appendChild(calidad);

  const acciones = document.createElement('td');
  acciones.className = 'col-acciones';
  if (puedeEscribir) {
    acciones.appendChild(crearBoton('Editar', 'btn pequeno secundario', () => abrirFormulario(lote)));
    acciones.appendChild(crearBoton('Eliminar', 'btn pequeno peligro', () => eliminar(lote)));
  }
  tr.appendChild(acciones);
  return tr;
}

async function cargar() {
  ocultar(el.aviso);
  try {
    const consulta = el.filtro.value ? `?resultado_calidad=${encodeURIComponent(el.filtro.value)}` : '';
    const lotes = await api(`/lotes${consulta}`);
    if (!lotes) return; // sesión vencida: api() ya redirigió al login
    el.tabla.replaceChildren(...lotes.map(dibujarFila));
    el.vacio.hidden = lotes.length > 0;
    if (lotes.some((l) => l.aviso)) {
      mostrar(el.aviso, 'Algunos datos del producto no están disponibles por ahora.');
    }
  } catch (error) {
    manejarError(error);
  }
}

// ---------- Formulario ----------
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
  el.dialogo.showModal();
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
    el.dialogo.close();
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

// ---------- Arranque ----------
el.usuario.textContent = `${sesion.nombre} · ${sesion.rol}`;
// Ocultar el botón es solo comodidad: el microservicio igual responde 403 si el rol no puede.
el.nuevo.hidden = !puedeEscribir;

el.salir.addEventListener('click', cerrarSesion);
el.filtro.addEventListener('change', cargar);
el.nuevo.addEventListener('click', () => abrirFormulario(null));
el.cancelar.addEventListener('click', () => el.dialogo.close());
el.form.addEventListener('submit', guardar);

llenarProductos().then(cargar);