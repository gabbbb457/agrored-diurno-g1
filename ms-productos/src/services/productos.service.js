// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/productos.repository');
const { validarProducto, construirProducto } = require('../models/producto');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const producto = await repo.findById(id);
  if (!producto) throw new HttpError(404, `No existe el producto con id ${id}`);
  return producto;
}

async function crear(datos) {
  const errores = validarProducto(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const producto = construirProducto(datos);

  // Regla de negocio: no puede haber dos productos con el mismo nombre.
  // 409 = Conflict (los datos son válidos, pero chocan con uno que ya existe).
  if (await repo.findByNombre(producto.nombre)) {
    throw new HttpError(409, `Ya existe un producto con el nombre ${producto.nombre}`);
  }

  return repo.create(producto);
}

module.exports = { listar, obtener, crear };