// ====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// ====================================================================
const repo = require('../repositories/lotes.repository');
const { validarLote, construirLote } = require('../models/lote');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
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

  // Regla de negocio: no puede haber dos lotes con el mismo código.
  // 409 = Conflict.
  if (await repo.findByCodigo(lote.codigo_lote)) {
    throw new HttpError(409, `Ya existe un lote con el código ${lote.codigo_lote}`);
  }

  return repo.create(lote);
}

module.exports = { listar, obtener, crear };