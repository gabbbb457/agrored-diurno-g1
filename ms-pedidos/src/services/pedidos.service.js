// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/pedidos.repository');
const { ESTADOS, validarPedido, construirPedido, construirActualizacion } = require('../models/pedido');
const HttpError = require('../utils/http-error');

// filtros: { estado } viene de ?estado=... (puede ser undefined)
async function listar(filtros = {}) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return repo.findAll(filtros);
}

async function obtener(id) {
  const pedido = await repo.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  return pedido;
}

async function crear(datos) {
  const errores = validarPedido(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // Taller 3: aquí se validará por REST que cliente_id y producto_id existen
  // (GET /clientes/:id y GET /productos/:id) antes de guardar.
  return repo.create(construirPedido(datos));
}

async function actualizar(id, datos) {
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el pedido con id ${id}`);

  const errores = validarPedido(datos, { completo: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  return repo.update(id, construirActualizacion(datos, existente));
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el pedido con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };