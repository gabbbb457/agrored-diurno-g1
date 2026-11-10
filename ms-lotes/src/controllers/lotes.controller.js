// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <->servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/lotes.service');
const HttpError = require('../utils/http-error');

// Lee el id de la URL; 400 si no es un entero positivo
function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  return id;
}

async function listar(req, res, next) {
  try {
    const filtros = { resultado_calidad: req.query.resultado_calidad };
    res.status(200).json(await service.listar(filtros));
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    res.status(200).json(await service.obtener(leerId(req)));
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const nuevo = await service.crear(req.body);
    res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    res.status(200).json(await service.actualizar(leerId(req), req.body));
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    await service.eliminar(leerId(req));
    res.status(204).end(); // 204 No Content: éxito, sin cuerpo
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
