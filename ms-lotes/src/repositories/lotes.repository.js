// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const lotes = [
  { id: 1, codigo_lote: 'L-2026-001', producto_id: 2, fecha_produccion: '2026-10-20', cantidad: 500, resultado_calidad: 'pendiente' },
  { id: 2, codigo_lote: 'L-2026-002', producto_id: 1, fecha_produccion: '2026-10-21', cantidad: 300, resultado_calidad: 'aprobado' },
  { id: 3, codigo_lote: 'L-2026-003', producto_id: 3, fecha_produccion: '2026-10-22', cantidad: 120, resultado_calidad: 'rechazado' },
];
let siguienteId = 4;

async function findAll() {
  return lotes;
}

async function findById(id) {
  return lotes.find((l) => l.id === id) || null;
}

async function findByCodigo(codigo) {
  return lotes.find((l) => l.codigo_lote.toLowerCase() === codigo.toLowerCase()) || null;
}

async function create(lote) {
  const nuevo = { id: siguienteId++, ...lote };
  lotes.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByCodigo, create };