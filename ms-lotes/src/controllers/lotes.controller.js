// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/lotes.service');
const HttpError = require('../utils/http-error');

async function listar(req, res, next) {
  try {
    res.status(200).json(await service.listar());
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un número entero positivo');
    res.status(200).json(await service.obtener(id));
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const nuevo = await service.crear(req.body);
    res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear };