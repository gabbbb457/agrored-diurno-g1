// =====================================================================
// CONEXIÓN A MYSQL (pertenece a la capa de acceso a datos)
// Crea un "pool": un conjunto de conexiones reutilizables a la base
// de datos de este microservicio. Los datos de conexión vienen del .env.
// =====================================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  dateStrings: true, // DATETIME llega como texto, no como objeto Date
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;