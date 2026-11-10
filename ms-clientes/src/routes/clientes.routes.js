// =====================================================================
// CAPA DE PRESENTACIÓN (rutas) · con seguridad JWT (Taller 2, semana 2)
// Permisos de AgroRed (tabla de permisos del Taller 1):
//   Clientes: consultan todos los autenticados; crean, modifican y
//   eliminan solo administrador y comercial.
// auth.js se copia SIN CAMBIOS de ms-usuarios (versión de la docente).
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen token (401 si falta o es inválido)

router.get('/', controller.listar);      // cualquier rol autenticado
router.get('/:id', controller.obtener);  // cualquier rol autenticado
router.post('/', requiereRol('administrador', 'comercial'), controller.crear);
router.put('/:id', requiereRol('administrador', 'comercial'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'comercial'), controller.eliminar);

module.exports = router;
