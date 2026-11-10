// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión MySQL: consultas parametrizadas contra lotes_db

const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM lotes';
  const condiciones = [];
  const valores = [];
  if (filtros.resultado_calidad) {
    condiciones.push('resultado_calidad = ?');
    valores.push(filtros.resultado_calidad);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM lotes WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByCodigo(codigo) {
  const [filas] = await pool.query('SELECT * FROM lotes WHERE codigo_lote = ?', [codigo]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(lote) {
  const [resultado] = await pool.query(
    'INSERT INTO lotes (codigo_lote, producto_id, fecha_produccion, cantidad, resultado_calidad) VALUES (?, ?, ?, ?, ?)',
    [lote.codigo_lote, lote.producto_id, lote.fecha_produccion, lote.cantidad, lote.resultado_calidad]);
  return findById(resultado.insertId);
}

async function update(id, lote) {
  const [resultado] = await pool.query(
    'UPDATE lotes SET codigo_lote = ?, producto_id = ?, fecha_produccion = ?, cantidad = ?, resultado_calidad = ? WHERE id = ?',
    [lote.codigo_lote, lote.producto_id, lote.fecha_produccion, lote.cantidad, lote.resultado_calidad, id]);
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM lotes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByCodigo, create, update, remove };