// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones. Valida por REST que
// el cliente y el producto existen, y compone cada pedido con el objeto
// cliente y el objeto producto.
// No sabe nada de HTTP (req/res): el token llega como un dato más.
// =====================================================================
const repo = require('../repositories/pedidos.repository');
const clientesClient = require('../clients/clientes.client');
const productosClient = require('../clients/productos.client');
const { ESTADOS, validarPedido, construirPedido, construirActualizacion } = require('../models/pedido');
const HttpError = require('../utils/http-error');

// COMPOSICIÓN: agrega a cada pedido su cliente y su producto, con UNA sola
// consulta por lotes (?ids=) a cada microservicio.
async function componer(pedidos, token) {
  const idsClientes = [...new Set(pedidos.map((p) => p.cliente_id))];
  const idsProductos = [...new Set(pedidos.map((p) => p.producto_id))];
  const [clientes, productos] = await Promise.all([
    clientesClient.clientesPorIds(idsClientes, token),
    productosClient.productosPorIds(idsProductos, token),
  ]);

  // Degradación controlada: si un servicio no responde, la respuesta sale igual
  const avisos = [];
  if (!clientes) avisos.push('ms-clientes no disponible');
  if (!productos) avisos.push('ms-productos no disponible');

  return pedidos.map((p) => {
    const compuesto = {
      ...p,
      cliente: clientes ? clientes.get(p.cliente_id) || null : null,
      producto: productos ? productos.get(p.producto_id) || null : null,
    };
    if (avisos.length > 0) compuesto.aviso = avisos.join(' · ');
    return compuesto;
  });
}

// VALIDACIÓN: el cliente y el producto deben existir (400 si no; 503 si el otro servicio no responde)
async function verificarReferencias(datos, token) {
  if (!(await clientesClient.existeCliente(datos.cliente_id, token))) {
    throw new HttpError(400, `No existe el cliente con id ${datos.cliente_id}`);
  }
  if (!(await productosClient.existeProducto(datos.producto_id, token))) {
    throw new HttpError(400, `No existe el producto con id ${datos.producto_id}`);
  }
}

// filtros: { estado } viene de ?estado=... (puede ser undefined)
async function listar(filtros = {}, token) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const pedido = await repo.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  const [compuesto] = await componer([pedido], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarPedido(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  await verificarReferencias(datos, token);

  const nuevo = await repo.create(construirPedido(datos));
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el pedido con id ${id}`);

  const errores = validarPedido(datos, { completo: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  await verificarReferencias(datos, token);

  const actualizado = await repo.update(id, construirActualizacion(datos, existente));
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el pedido con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };