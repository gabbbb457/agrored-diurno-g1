// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos: ahora en MySQL.
// Las funciones son las mismas de antes (async), por eso el servicio,
// el controlador y las rutas no cambian.
// Todas las consultas son parametrizadas (?) para evitar inyección SQL.
// =====================================================================
const pool = require('../db');

const COLUMNAS = 'id, cliente_id, producto_id, cantidad, centro_distribucion, estado, created_at, updated_at';

// MySQL devuelve 'AAAA-MM-DD HH:MM:SS'; la API responde 'AAAA-MM-DDTHH:MM:SS'
function aPedido(fila) {
  return {
    ...fila,
    created_at: String(fila.created_at).replace(' ', 'T'),
    updated_at: String(fila.updated_at).replace(' ', 'T'),
  };
}

// filtros: { estado } (si viene, devuelve solo los pedidos con ese estado)
async function findAll(filtros = {}) {
  let sql = `SELECT ${COLUMNAS} FROM pedidos`;
  const valores = [];
  if (filtros.estado !== undefined) {
    sql += ' WHERE estado = ?';
    valores.push(filtros.estado);
  }
  sql += ' ORDER BY id';
  const [filas] = await pool.execute(sql, valores);
  return filas.map(aPedido);
}

async function findById(id) {
  const [filas] = await pool.execute(`SELECT ${COLUMNAS} FROM pedidos WHERE id = ?`, [id]);
  return filas.length > 0 ? aPedido(filas[0]) : null;
}

async function create(pedido) {
  const [resultado] = await pool.execute(
    `INSERT INTO pedidos (cliente_id, producto_id, cantidad, centro_distribucion, estado, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pedido.cliente_id, pedido.producto_id, pedido.cantidad, pedido.centro_distribucion,
      pedido.estado, pedido.created_at, pedido.updated_at],
  );
  return { id: resultado.insertId, ...pedido };
}

// Reemplaza el pedido completo (conserva el id). Devuelve null si no existe.
async function update(id, datos) {
  const [resultado] = await pool.execute(
    `UPDATE pedidos
     SET cliente_id = ?, producto_id = ?, cantidad = ?, centro_distribucion = ?,
         estado = ?, created_at = ?, updated_at = ?
     WHERE id = ?`,
    [datos.cliente_id, datos.producto_id, datos.cantidad, datos.centro_distribucion,
      datos.estado, datos.created_at, datos.updated_at, id],
  );
  if (resultado.affectedRows === 0) return null;
  return { id, ...datos };
}

// Elimina el pedido. Devuelve true si existía, false si no.
async function remove(id) {
  const [resultado] = await pool.execute('DELETE FROM pedidos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };