// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/cliente');
const HttpError = require('../utils/http-error');

async function listar(filtros = {}) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

// Regla de negocio: no puede haber dos clientes con el mismo NIT
// (el NIT identifica legalmente a la empresa cliente). 409 = Conflict.
// idActual permite que un cliente conserve su propio NIT al actualizarse.
async function verificarNitUnico(nit, idActual) {
  const existente = await repo.findByNit(nit);
  if (existente && existente.id !== idActual) {
    throw new HttpError(409, `Ya existe un cliente con el NIT ${nit}`);
  }
}

async function crear(datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);
  await verificarNitUnico(cliente.nit);
  return repo.create(cliente);
}

// PUT: reemplaza el cliente completo. Valida igual que crear.
async function actualizar(id, datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const existente = await obtener(id); // 404 si no existe
  // fecha_registro es la fecha de creación: no cambia al actualizar
  const cliente = { ...construirCliente(datos), fecha_registro: existente.fecha_registro };
  await verificarNitUnico(cliente.nit, id);
  return repo.update(id, cliente);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el cliente con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
