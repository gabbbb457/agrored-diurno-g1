// =====================================================================
// PANTALLA DE PEDIDOS (responsable: María Paula Zambrano · ms-pedidos)
// Lista, filtra por estado, crea, edita y elimina pedidos.
// Cada pedido guarda solo cliente_id y producto_id; los nombres se
// muestran con las listas de clientes y productos (o con los objetos
// cliente y producto que compone la API real).
// Los botones de crear, editar y eliminar solo aparecen para
// administrador y comercial. produccion solo consulta.
// =====================================================================
pintarEncabezado('pedidos.html');
const PUEDE_EDITAR = Sesion.puedeEditar('pedidos');
const CENTROS = ['Bogotá', 'Cali'];
const ESTADOS = ['recibido', 'despachado', 'entregado'];

let pedidos = [];        // lista cargada desde Api.listar('pedidos')
let clientes = [];       // para el selector y para mostrar el nombre
let productos = [];
let idEditando = null;   // null = creando; un número = editando ese pedido

const tabla = document.getElementById('cuerpo-tabla');
const filtro = document.getElementById('filtro-estado');
const aviso = document.getElementById('aviso');
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

async function cargar() {
  try {
    [pedidos, clientes, productos] = await Promise.all([
      Api.listar('pedidos'),
      Api.listar('clientes'),
      Api.listar('productos'),
    ]);
  } catch (error) {
    tabla.innerHTML = `<tr><td class="vacio" colspan="8">No se pudo cargar: ${escapar(error.message)}</td></tr>`;
    return;
  }
  pintarSelectores();
  pintarTabla();
}

// ---- Nombres (la lista actual manda; si no está, el objeto compuesto por la API)
function nombreCliente(p) {
  const c = clientes.find((x) => x.id === p.cliente_id);
  return c ? c.nombre : (p.cliente ? p.cliente.nombre : `Cliente #${p.cliente_id}`);
}

function nombreProducto(p) {
  const x = productos.find((y) => y.id === p.producto_id);
  return x ? x.nombre : (p.producto ? p.producto.nombre : `Producto #${p.producto_id}`);
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
      <td data-titulo="Cliente">${escapar(nombreCliente(p))}</td>
      <td data-titulo="Producto">${escapar(nombreProducto(p))}</td>
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
function pintarSelectores() {
  document.getElementById('cliente_id').innerHTML = clientes
    .map((c) => `<option value="${c.id}">${escapar(c.nombre)}</option>`).join('');
  document.getElementById('producto_id').innerHTML = productos
    .map((p) => `<option value="${p.id}">${escapar(p.nombre)}</option>`).join('');
}

function abrirFormulario(id) {
  idEditando = id;
  const p = pedidos.find((x) => x.id === id)
    || { cliente_id: '', producto_id: '', cantidad: '', centro_distribucion: CENTROS[0], estado: 'recibido' };
  document.getElementById('titulo-formulario').textContent = id ? `Editar pedido ${id}` : 'Nuevo pedido';
  for (const campo of ['cliente_id', 'producto_id', 'cantidad', 'centro_distribucion', 'estado']) {
    document.getElementById(campo).value = p[campo];
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
      const actual = pedidos.find((p) => p.id === idEditando);
      // Con datos de ejemplo no hay API que ponga las fechas; con la API real las ignora
      await Api.actualizar('pedidos', idEditando, { ...datos, created_at: actual.created_at, updated_at: ahoraTexto() });
    } else {
      await Api.crear('pedidos', { ...datos, created_at: ahoraTexto(), updated_at: ahoraTexto() });
    }
    cerrarFormulario();
    await cargar();
  } catch (error) {
    errores.textContent = error.message; // por ejemplo el 400 "No existe el cliente con id X" o el 503 de la API
  }
}

// ---- Eliminar
async function eliminar(id) {
  if (!confirm(`¿Eliminar el pedido ${id}?`)) return;
  try {
    await Api.eliminar('pedidos', id);
    await cargar();
  } catch (error) {
    alert(error.message);
  }
}