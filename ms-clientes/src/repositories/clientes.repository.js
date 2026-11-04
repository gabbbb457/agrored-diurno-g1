// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión en memoria (se pierden al reiniciar). En la Parte 3 del
// Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', nit: '900123456-1', email: 'contacto@elvalle.com', telefono: '3001234567', ciudad: 'Cali', fecha_registro: '2026-10-01', activo: true },
  { id: 2, nombre: 'Comercial Andina', nit: '800987654-3', email: 'ventas@andina.com', telefono: '3109876543', ciudad: 'Medellín', fecha_registro: '2026-10-05', activo: true },
  { id: 3, nombre: 'Supermercados del Pacífico', nit: '901234567-8', email: 'info@superpacifico.com', telefono: '3205558899', ciudad: 'Buenaventura', fecha_registro: '2026-10-12', activo: false },
];
let siguienteId = 4;

// filtros: { ciudad, ids }
async function findAll(filtros = {}) {
  let resultado = clientes;
  if (filtros.ciudad) {
    const ciudad = filtros.ciudad.toLowerCase();
    resultado = resultado.filter((c) => c.ciudad.toLowerCase() === ciudad);
  }
  if (filtros.ids) {
    resultado = resultado.filter((c) => filtros.ids.includes(c.id));
  }
  return resultado;
}

async function findById(id) {
  return clientes.find((c) => c.id === id) || null;
}

async function findByNit(nit) {
  return clientes.find((c) => c.nit === nit) || null;
}

async function create(cliente) {
  const nuevo = { id: siguienteId++, ...cliente };
  clientes.push(nuevo);
  return nuevo;
}

// Reemplaza el cliente completo (conserva el id). null si no existe.
async function update(id, datos) {
  const i = clientes.findIndex((c) => c.id === id);
  if (i === -1) return null;
  clientes[i] = { id, ...datos };
  return clientes[i];
}

// true si existía y se eliminó; false si no existía
async function remove(id) {
  const i = clientes.findIndex((c) => c.id === id);
  if (i === -1) return false;
  clientes.splice(i, 1);
  return true;
}

module.exports = { findAll, findById, findByNit, create, update, remove };
