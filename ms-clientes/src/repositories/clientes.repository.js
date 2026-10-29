// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', nit: '900123456-1', email: 'contacto@elvalle.com', telefono: '3001234567', ciudad: 'Cali', fecha_registro: '2026-10-01', activo: true },
  { id: 2, nombre: 'Comercial Andina', nit: '800987654-3', email: 'ventas@andina.com', telefono: '3109876543', ciudad: 'Medellín', fecha_registro: '2026-10-05', activo: true },
  { id: 3, nombre: 'Supermercados del Pacífico', nit: '901234567-8', email: 'info@superpacifico.com', telefono: '3205558899', ciudad: 'Buenaventura', fecha_registro: '2026-10-12', activo: false },
];
let siguienteId = 4;

async function findAll() {
  return clientes;
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

module.exports = { findAll, findById, findByNit, create };
