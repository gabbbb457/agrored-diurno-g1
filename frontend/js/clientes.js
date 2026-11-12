// =====================================================================
// PANTALLA DE CLIENTES (responsable: Miguel Ángel Vanegas · ms-clientes)
// Lista, filtra por ciudad, crea, edita y elimina clientes.
// Los botones de crear, editar y eliminar solo aparecen para los roles
// con permiso (administrador y comercial). produccion solo consulta.
// =====================================================================
pintarEncabezado('clientes.html');
const PUEDE_EDITAR = Sesion.puedeEditar('clientes');

let clientes = [];       // lista cargada desde Api.listar('clientes')
let idEditando = null;   // null = creando; un número = editando ese cliente

const tabla = document.getElementById('cuerpo-tabla');
const filtro = document.getElementById('filtro-ciudad');
const ventana = document.getElementById('ventana');
const formulario = document.getElementById('formulario');
const errores = document.getElementById('errores');

// ---- Arranque
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
  clientes = await Api.listar('clientes');
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
    alert(error.message);
  }
}
