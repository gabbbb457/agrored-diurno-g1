// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// =====================================================================
const express = require('express');
const cors = require('cors');
const clientesRoutes = require('./routes/clientes.routes');

const app = express();

// CORS: permite que el frontend abierto en el navegador (otro origen)
// llame a este microservicio. En el Taller 3, detrás del gateway, no hace falta.
app.use(cors());

// Middleware: convierte el cuerpo JSON de la petición en un objeto (req.body)
app.use(express.json());

// Registro de peticiones en la terminal: deja ver las consultas que llegan
// desde ms-pedidos (GET /clientes/:id y GET /clientes?ids=...)
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });
  next();
});

// Endpoint de salud: permite verificar que el microservicio está vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-clientes', estado: 'ok' });
});

// Rutas del recurso. Todas las URIs de este microservicio empiezan por /clientes
app.use('/clientes', clientesRoutes);

// Cualquier otra ruta: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo centralizado de errores (los lanza la capa de servicio)
app.use((err, req, res, next) => {
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message, detalles: err.detalles });
});

module.exports = app;
