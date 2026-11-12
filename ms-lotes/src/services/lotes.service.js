const repo = require('../repositories/lotes.repository');
const { validarLote, construirLote } = require('../models/lote');
const productosClient = require('../clients/productos.client');
const HttpError = require('../utils/http-error');

// Agrega a cada lote su objeto producto, con UNA sola consulta a ms-productos
async function componer(lotes, token) {
  const ids = [...new Set(lotes.map((l) => l.producto_id))];
  const productos = await productosClient.productosPorIds(ids, token);
  if (!productos) { // degradación controlada
    return lotes.map((l) => ({ ...l, producto: null, aviso: 'ms-productos no disponible' }));
  }
  return lotes.map((l) => ({ ...l, producto: productos.get(l.producto_id) || null }));
}

async function listar(filtros, token) {
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const lote = await repo.findById(id);
  if (!lote) throw new HttpError(404, `No existe el lote con id ${id}`);
  const [compuesto] = await componer([lote], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarLote(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  if (!(await productosClient.existeProducto(datos.producto_id, token))) {
    throw new HttpError(400, `No existe el producto con id ${datos.producto_id}`);
  }

  const lote = construirLote(datos);
  if (await repo.findByCodigo(lote.codigo_lote)) {
    throw new HttpError(409, `Ya existe un lote con el código ${lote.codigo_lote}`);
  }
  const nuevo = await repo.create(lote);
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el lote con id ${id}`);

  const errores = validarLote(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  if (!(await productosClient.existeProducto(datos.producto_id, token))) {
    throw new HttpError(400, `No existe el producto con id ${datos.producto_id}`);
  }

  const lote = construirLote(datos);
  const otro = await repo.findByCodigo(lote.codigo_lote);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un lote con el código ${lote.codigo_lote}`);
  }
  const actualizado = await repo.update(id, lote);
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el lote con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };