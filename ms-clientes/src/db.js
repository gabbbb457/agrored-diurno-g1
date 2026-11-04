// =====================================================================
// CONEXIÓN A MYSQL (pertenece a la capa de acceso a datos)
// Pool: conjunto de conexiones reutilizables a clientes_db.
// Los datos de conexión vienen del archivo .env.
// =====================================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
  dateStrings: true,     // fechas como texto '2026-10-01', no como objetos Date
  decimalNumbers: true,  // los DECIMAL llegan como números, no como texto
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
