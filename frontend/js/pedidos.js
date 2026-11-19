// =====================================================================
// PANTALLA DE PEDIDOS (responsable: María Paula Zambrano · ms-pedidos)
// Lista, filtra por estado, crea, edita y elimina pedidos con la API real.
//
// La lista hace UNA sola petición: GET /api/pedidos. ms-pedidos entrega
// cada pedido ya compuesto con su objeto cliente y su objeto producto
// (o null más un aviso si ms-clientes o ms-productos no respondieron).
// El frontend muestra esos datos tal como llegan: no une nada por su cuenta.
// Las listas de clientes y productos solo se piden al abrir el formulario,
// para llenar los selectores.
//
// Los botones de crear, editar y eliminar solo aparecen para
// administrador y comercial. produccion solo consulta (y si pidiera la
// operación, el 403 de la API se muestra como mensaje).
// =====================================================================
pintarEncabezado('pedidos.html');
const PUEDE_EDITAR = Sesion.puedeEditar('pedidos');
const CENTROS = ['Bogotá', 'Cali'];
const ESTADOS = ['recibido', 'despachado', 'entregado'];

let pedidos = [];        // lista cargada desde Api.listar('pedidos')
let clientes = [];       // solo para el selector del formulario
let productos = [];      // solo para el selector del formulario
let idEditando = null;   // null = creando; un número = editando ese pedido

const tabla = document.getElementById('cuerpo-tabla');
const filtro = document.getElementById('filtro-estado');
const aviso = document.getElementById('aviso');
const mensaje = document.getElementById('mensaje');
const ventana = document.getElementById('ventana');
const formulario = document.getElementById('formulario');
const errores = document.getElementById('errores');

// ---- Arranque
if (PUEDE_EDITAR) {
  document.getElementById('zona-nuevo').innerHTML = '<button class="boton" id="nuevo">+ Nuevo pedido</button>';
  document.getElementById('nuevo').addEventListener('click', () => abrirFormulario(null));
} else {
  document.getElementById('th-acciones').remove();
  document.getElementById('subtitulo').textContent += ' · solo consulta para tu rol';
}
filtro.addEventListener('change', pintarTabla);
document.getElementById('cancelar').addEventListener('click', cerrarFormulario);
formulario.addEventListener('submit', guardar);
cargar();

// Mensaje de error visible en la página (400, 403, 409, 503...)
function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.style.display = texto ? 'block' : 'none';
}

async function cargar() {
  try {
    pedidos = await Api.listar('pedidos'); // una sola petición
    mostrarMensaje('');
  } catch (error) {
    pedidos = [];
    mostrarMensaje(error.message);
  }
  pintarTabla();
}

// ---- Datos relacionados: exactamente lo que entrega el backend
function textoRelacionado(objeto) {
  return objeto
    ? escapar(objeto.nombre)
    : '<span style="color:#888;font-style:italic">no disponible</span>';
}

// ---- Lista
function pintarTabla() {
  // Degradación: si la API avisó que un servicio no respondió, se muestra
  const avisos = [...new Set(pedidos.map((p) => p.aviso).filter(Boolean))];
  aviso.style.display = avisos.length ? 'block' : 'none';
  aviso.textContent = avisos.join(' · ');

  const visibles = pedidos.filter((p) => !filtro.value || p.estado === filtro.value);
  if (visibles.length === 0) {
    tabla.innerHTML = '<tr><td class="vacio" colspan="8">No hay pedidos para mostrar</td></tr>';
    return;
  }
  tabla.innerHTML = visibles.map((p) => `
    <tr>
      <td data-titulo="N.º">${p.id}</td>
      <td data-titulo="Cliente">${textoRelacionado(p.cliente)}</td>
      <td data-titulo="Producto">${textoRelacionado(p.producto)}</td>
      <td data-titulo="Cantidad">${escapar(p.cantidad)}</td>
      <td data-titulo="Centro">${escapar(p.centro_distribucion)}</td>
      <td data-titulo="Estado"><span class="estado ${p.estado === 'entregado' ? 'activo' : ''}">${escapar(p.estado)}</span></td>
      <td data-titulo="Fecha" class="nowrap">${escapar(String(p.created_at || '').slice(0, 10))}</td>
      ${PUEDE_EDITAR ? `
      <td data-titulo="Acciones" class="nowrap">
        <button class="boton pequeno" onclick="abrirFormulario(${p.id})">Editar</button>
        <button class="boton pequeno peligro" onclick="eliminar(${p.id})">Eliminar</button>
      </td>` : ''}
    </tr>`).join('');
}

// ---- Formulario (crear y editar)
// Los clientes y productos se piden aquí, solo para llenar los selectores.
async function cargarOpciones() {
  [clientes, productos] = await Promise.all([
    Api.listar('clientes'),
    Api.listar('productos'),
  ]);
}

function pintarSelectores(pedido) {
  // Se ofrecen los activos; en una edición se conserva el que ya tenía el pedido
  const opciones = (lista, idActual) => lista
    .filter((x) => x.activo !== false || x.id === idActual)
    .map((x) => `<option value="${x.id}">${escapar(x.nombre)}</option>`).join('');
  document.getElementById('cliente_id').innerHTML = opciones(clientes, pedido && pedido.cliente_id);
  document.getElementById('producto_id').innerHTML = opciones(productos, pedido && pedido.producto_id);
}

async function abrirFormulario(id) {
  idEditando = id;
  const p = pedidos.find((x) => x.id === id) || null;
  try {
    await cargarOpciones();
  } catch (error) {
    mostrarMensaje(`No se pudieron cargar los clientes y productos para el formulario. ${error.message}`);
    return;
  }
  mostrarMensaje('');
  pintarSelectores(p);
  const base = p || { cliente_id: clientes[0] ? clientes[0].id : '', producto_id: productos[0] ? productos[0].id : '', cantidad: '', centro_distribucion: CENTROS[0], estado: 'recibido' };
  document.getElementById('titulo-formulario').textContent = id ? `Editar pedido ${id}` : 'Nuevo pedido';
  for (const campo of ['cliente_id', 'producto_id', 'cantidad', 'centro_distribucion', 'estado']) {
    document.getElementById(campo).value = base[campo];
  }
  errores.textContent = '';
  ventana.classList.add('abierta');
}

function cerrarFormulario() {
  ventana.classList.remove('abierta');
}

function leerFormulario() {
  return {
    cliente_id: Number(document.getElementById('cliente_id').value),
    producto_id: Number(document.getElementById('producto_id').value),
    cantidad: Number(document.getElementById('cantidad').value),
    centro_distribucion: document.getElementById('centro_distribucion').value,
    estado: document.getElementById('estado').value,
  };
}

// Las mismas reglas del modelo de ms-pedidos, para avisar antes de enviar.
// La API las vuelve a validar (y comprueba que el cliente y el producto existan).
function validar(datos) {
  const lista = [];
  if (!clientes.some((c) => c.id === datos.cliente_id)) lista.push('Elige un cliente');
  if (!productos.some((p) => p.id === datos.producto_id)) lista.push('Elige un producto');
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) lista.push('La cantidad debe ser un entero positivo');
  if (!CENTROS.includes(datos.centro_distribucion)) lista.push(`El centro debe ser: ${CENTROS.join(' o ')}`);
  if (!ESTADOS.includes(datos.estado)) lista.push(`El estado debe ser: ${ESTADOS.join(', ')}`);
  return lista;
}

function ahoraTexto() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Solo con datos de ejemplo (Taller 2): no hay API que ponga las fechas ni
// que componga el cliente y el producto, así que se simulan.
function camposSimulados(datos, actual) {
  const cliente = clientes.find((c) => c.id === datos.cliente_id);
  const producto = productos.find((p) => p.id === datos.producto_id);
  return {
    created_at: actual ? actual.created_at : ahoraTexto(),
    updated_at: ahoraTexto(),
    cliente: cliente ? { id: cliente.id, nombre: cliente.nombre } : null,
    producto: producto ? { id: producto.id, nombre: producto.nombre } : null,
  };
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
    const actual = idEditando ? pedidos.find((p) => p.id === idEditando) : null;
    const envio = CONFIG.USAR_DATOS_EJEMPLO ? { ...datos, ...camposSimulados(datos, actual) } : datos;
    if (idEditando) {
      await Api.actualizar('pedidos', idEditando, envio); // PUT: el pedido completo
    } else {
      await Api.crear('pedidos', envio);
    }
    cerrarFormulario();
    await cargar();
  } catch (error) {
    errores.textContent = error.message; // 400 (por ejemplo "No existe el cliente con id X"), 403, 503...
  }
}

// ---- Eliminar
async function eliminar(id) {
  if (!confirm(`¿Eliminar el pedido ${id}?`)) return;
  try {
    await Api.eliminar('pedidos', id);
    await cargar();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}