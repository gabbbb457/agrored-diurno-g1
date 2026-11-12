// =====================================================================
// PANTALLA DE PRODUCTOS (responsable: Daniela Valverde · ms-productos)
// Lista, filtra por categoría, crea, edita y elimina productos.
// Los botones de crear, editar y eliminar solo aparecen para los roles
// con permiso (administrador y produccion). comercial solo consulta.
// =====================================================================
pintarEncabezado('productos.html');
const PUEDE_EDITAR = Sesion.puedeEditar('productos');

// Valores permitidos: los mismos del modelo de ms-productos
const CATEGORIAS = ['fruta', 'hortaliza', 'procesado'];
const UNIDADES = ['kg', 'caja'];

let productos = [];      // lista cargada desde Api.listar('productos')
let idEditando = null;   // null = creando; un número = editando ese producto

const tabla = document.getElementById('cuerpo-tabla');
const filtro = document.getElementById('filtro-categoria');
const ventana = document.getElementById('ventana');
const formulario = document.getElementById('formulario');
const errores = document.getElementById('errores');

// ---- Arranque
if (PUEDE_EDITAR) {
  document.getElementById('zona-nuevo').innerHTML = '<button class="boton" id="nuevo">+ Nuevo producto</button>';
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
  productos = await Api.listar('productos');
  pintarTabla();
}

// ---- Lista
// Precio en pesos colombianos: 45000 -> $ 45.000
function formatoPrecio(valor) {
  return '$ ' + Number(valor).toLocaleString('es-CO');
}

function pintarTabla() {
  const visibles = productos.filter((p) => !filtro.value || p.categoria === filtro.value);
  if (visibles.length === 0) {
    tabla.innerHTML = '<tr><td class="vacio" colspan="5">No hay productos para mostrar</td></tr>';
    return;
  }
  tabla.innerHTML = visibles.map((p) => `
    <tr>
      <td data-titulo="Nombre">${escapar(p.nombre)}</td>
      <td data-titulo="Categoría">${escapar(p.categoria)}</td>
      <td data-titulo="Unidad">${escapar(p.unidad)}</td>
      <td data-titulo="Precio" class="nowrap">${formatoPrecio(p.precio)}</td>
      ${PUEDE_EDITAR ? `
      <td data-titulo="Acciones" class="nowrap">
        <button class="boton pequeno" onclick="abrirFormulario(${p.id})">Editar</button>
        <button class="boton pequeno peligro" onclick="eliminar(${p.id})">Eliminar</button>
      </td>` : ''}
    </tr>`).join('');
}

// ---- Formulario (crear y editar)
function abrirFormulario(id) {
  idEditando = id;
  const p = productos.find((x) => x.id === id) || { nombre: '', categoria: '', unidad: '', precio: '' };
  document.getElementById('titulo-formulario').textContent = id ? 'Editar producto' : 'Nuevo producto';
  for (const campo of ['nombre', 'categoria', 'unidad', 'precio']) {
    document.getElementById(campo).value = p[campo];
  }
  errores.textContent = '';
  ventana.classList.add('abierta');
}

function cerrarFormulario() {
  ventana.classList.remove('abierta');
}

function leerFormulario() {
  const precio = document.getElementById('precio').value;
  return {
    nombre: document.getElementById('nombre').value.trim(),
    categoria: document.getElementById('categoria').value,
    unidad: document.getElementById('unidad').value,
    precio: precio === '' ? null : Number(precio),
  };
}

// Las mismas reglas del modelo y del servicio de ms-productos,
// para avisar antes de enviar. La API las vuelve a validar.
function validar(datos) {
  const lista = [];
  if (!datos.nombre) lista.push('El nombre es obligatorio');
  if (!CATEGORIAS.includes(datos.categoria)) lista.push('La categoría debe ser fruta, hortaliza o procesado');
  if (!UNIDADES.includes(datos.unidad)) lista.push('La unidad debe ser kg o caja');
  if (datos.precio === null || !(datos.precio > 0)) lista.push('El precio es obligatorio y debe ser mayor que 0');
  // Regla de negocio: nombre único sin distinguir mayúsculas (en la API responde 409)
  const repetido = productos.find((p) => p.nombre.toLowerCase() === datos.nombre.toLowerCase() && p.id !== idEditando);
  if (repetido) lista.push(`Ya existe un producto con el nombre ${repetido.nombre}`);
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
      await Api.actualizar('productos', idEditando, datos); // PUT: el producto completo
    } else {
      await Api.crear('productos', datos);
    }
    cerrarFormulario();
    await cargar();
  } catch (error) {
    errores.textContent = error.message; // por ejemplo el 409 del nombre repetido que responde la API
  }
}

// ---- Eliminar
async function eliminar(id) {
  const p = productos.find((x) => x.id === id);
  if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
  try {
    await Api.eliminar('productos', id);
    await cargar();
  } catch (error) {
    alert(error.message);
  }
}
