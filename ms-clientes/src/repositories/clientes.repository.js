// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) · versión MySQL
// Única capa que sabe DÓNDE se guardan los datos: ahora en clientes_db.
// Las funciones conservan el mismo nombre, parámetros y resultado que
// la versión en memoria, por eso rutas, controlador, servicio y modelo
// no cambian. Todas las consultas son parametrizadas (?) para evitar
// inyección SQL.
// =====================================================================
const pool = require('../db');

const COLUMNAS = 'id, nombre, nit, email, telefono, ciudad, fecha_registro, activo';

// MySQL guarda BOOLEAN como 0/1: se traduce al formato del contrato
function aCliente(fila) {
  return { ...fila, activo: Boolean(fila.activo) };
}

// filtros: { ciudad, ids }
async function findAll(filtros = {}) {
  let sql = `SELECT ${COLUMNAS} FROM clientes`;
  const condiciones = [];
  const valores = [];
  if (filtros.ciudad) {
    condiciones.push('ciudad = ?');
    valores.push(filtros.ciudad);
  }
  if (filtros.ids) {                       // ?ids=1,2,3 -> WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aCliente);
}

async function findById(id) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM clientes WHERE id = ?`, [id]);
  return filas.length > 0 ? aCliente(filas[0]) : null;
}

async function findByNit(nit) {
  const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM clientes WHERE nit = ?`, [nit]);
  return filas.length > 0 ? aCliente(filas[0]) : null;
}

async function create(cliente) {
  const [resultado] = await pool.query(
    `INSERT INTO clientes (nombre, nit, email, telefono, ciudad, fecha_registro, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cliente.nombre, cliente.nit, cliente.email, cliente.telefono,
      cliente.ciudad, cliente.fecha_registro, cliente.activo],
  );
  return findById(resultado.insertId); // MySQL devuelve el id generado
}

// Reemplaza el cliente completo (conserva el id). null si no existe.
async function update(id, datos) {
  const [resultado] = await pool.query(
    `UPDATE clientes
     SET nombre = ?, nit = ?, email = ?, telefono = ?, ciudad = ?, fecha_registro = ?, activo = ?
     WHERE id = ?`,
    [datos.nombre, datos.nit, datos.email, datos.telefono,
      datos.ciudad, datos.fecha_registro, datos.activo, id],
  );
  if (resultado.affectedRows === 0) return null; // ninguna fila con ese id
  return findById(id);
}

// true si existía y se eliminó; false si no existía
async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNit, create, update, remove };
