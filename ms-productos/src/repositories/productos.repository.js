// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) - version MySQL
// Única capa que sabe DÓNDE se guardan los datos.
// // Las funciones conservan el mismo nombre, parámetros y tipo de resultado que la versión en memoria, por eso las demás capas no cambian.
// =====================================================================

const pool = require('../db');


// filtros opcionales: { categoria, ids }
async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM productos';
  const condiciones = [];
  const valores = [];

  if (filtros.categoria) {
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }

  if (filtros.ids) { // ?ids=1,3 -> WHERE id IN (1, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }

  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');

    const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

// Busca por nombre sin distinguir mayúsculas (para la regla de nombre único)
async function findByNombre(nombre) {
  const [filas] = await pool.query('SELECT * FROM productos WHERE nombre = ?', [nombre]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(producto) {
  const [resultado] = await pool.query(
    'INSERT INTO productos (nombre, categoria, unidad, precio) VALUES (?, ?, ?, ?)',
    [producto.nombre, producto.categoria, producto.unidad, producto.precio]);
  return findById(resultado.insertId); // MySQL devuelve el id generado
}


// Reemplaza los datos del producto, conservando su id
async function update(id, datos) {
  await pool.query(
    'UPDATE productos SET nombre = ?, categoria = ?, unidad = ?, precio = ? WHERE id = ?',
    [datos.nombre, datos.categoria, datos.unidad, datos.precio, id]);
  return findById(id);
}

// Elimina el producto. Devuelve true si existía, false si no
async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows > 0; // affectedRows = cuántas filas se borraron
}


module.exports = { findAll, findById, findByNombre, create, update, remove };