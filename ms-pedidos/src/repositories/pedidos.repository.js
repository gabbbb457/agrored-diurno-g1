// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Datos en memoria (se pierden al reiniciar). Más adelante se reemplaza
// por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const pedidos = [
  { id: 1, cliente_id: 1, producto_id: 1, cantidad: 120, centro_distribucion: 'Bogotá', estado: 'recibido', created_at: '2026-10-26T09:30:00', updated_at: '2026-10-26T09:30:00' },
  { id: 2, cliente_id: 2, producto_id: 3, cantidad: 40, centro_distribucion: 'Cali', estado: 'despachado', created_at: '2026-10-24T14:15:00', updated_at: '2026-10-25T08:00:00' },
  { id: 3, cliente_id: 1, producto_id: 2, cantidad: 75, centro_distribucion: 'Cali', estado: 'entregado', created_at: '2026-10-20T11:00:00', updated_at: '2026-10-22T16:45:00' },
];
let siguienteId = 4;

// filtros: { estado } (si viene, devuelve solo los pedidos con ese estado)
async function findAll(filtros = {}) {
  return pedidos.filter((p) => filtros.estado === undefined || p.estado === filtros.estado);
}

async function findById(id) {
  return pedidos.find((p) => p.id === id) || null;
}

async function create(pedido) {
  const nuevo = { id: siguienteId++, ...pedido };
  pedidos.push(nuevo);
  return nuevo;
}

// Reemplaza el pedido completo (conserva el id). Devuelve null si no existe.
async function update(id, datos) {
  const i = pedidos.findIndex((p) => p.id === id);
  if (i === -1) return null;
  pedidos[i] = { id, ...datos };
  return pedidos[i];
}

// Elimina el pedido. Devuelve true si existía, false si no.
async function remove(id) {
  const i = pedidos.findIndex((p) => p.id === id);
  if (i === -1) return false;
  pedidos.splice(i, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };