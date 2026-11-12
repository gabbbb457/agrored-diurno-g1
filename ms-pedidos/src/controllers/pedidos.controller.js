// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, query, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// El token (cabecera Authorization) se le pasa al servicio como un dato más,
// para que lo reenvíe a ms-clientes y a ms-productos.
// =====================================================================
const service = require('../services/pedidos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /pedidos  y  GET /pedidos?estado=despachado
async function listar(req, res) {
  const filtros = { estado: req.query.estado };
  if (filtros.estado !== undefined && typeof filtros.estado !== 'string') {
    throw new HttpError(400, 'estado debe ser un solo valor');
  }
  const pedidos = await service.listar(filtros, req.headers.authorization);
  res.status(200).json(pedidos);
}

// GET /pedidos/:id
async function obtener(req, res) {
  const pedido = await service.obtener(leerId(req), req.headers.authorization);
  res.status(200).json(pedido);
}

// POST /pedidos
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /pedidos/:id
async function actualizar(req, res) {
  const pedido = await service.actualizar(leerId(req), req.body, req.headers.authorization);
  res.status(200).json(pedido);
}

// DELETE /pedidos/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };