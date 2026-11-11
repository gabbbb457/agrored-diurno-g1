// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y aplica los permisos por rol.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen un token válido

// Cualquier usuario autenticado puede consultar
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// Solo administrador y produccion crean, modifican y eliminan productos
router.post('/', requiereRol('administrador', 'produccion'), controller.crear);
router.put('/:id', requiereRol('administrador', 'produccion'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'produccion'), controller.eliminar);

module.exports = router;