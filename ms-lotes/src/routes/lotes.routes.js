const { Router } = require('express');
const controller = require('../controllers/lotes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen token

router.get('/', controller.listar);        // cualquier rol autenticado
router.get('/:id', controller.obtener);
router.post('/', requiereRol('administrador', 'produccion'), controller.crear);
router.put('/:id', requiereRol('administrador', 'produccion'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'produccion'), controller.eliminar);

module.exports = router;