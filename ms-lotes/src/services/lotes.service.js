// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
const repo = require('../repositories/lotes.repository');
const { validarLote, construirLote } = require('../models/lote');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const lote = await repo.findById(id);
  if (!lote) throw new HttpError(404, `No existe el lote con id ${id}`);
  return lote;
}

async function crear(datos) {
  const errores = validarLote(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const lote = construirLote(datos);

  // Regla de negocio: no puede haber dos lotes con el mismo código (409 = Conflict)
  if (await repo.findByCodigo(lote.codigo_lote)) {
    throw new HttpError(409, `Ya existe un lote con el código ${lote.codigo_lote}`);
  }
  return repo.create(lote);
}

async function actualizar(id, datos) {
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el lote con id ${id}`);

  const errores = validarLote(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const lote = construirLote(datos);

  // El código puede repetirse solo si es el del propio lote que se actualiza
  const otro = await repo.findByCodigo(lote.codigo_lote);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un lote con el código ${lote.codigo_lote}`);
  }
  return repo.update(id, lote);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el lote con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };