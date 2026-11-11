// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
//const { Router } = require('express');
//const controller = require('../controllers/pedidos.controller');

//const router = Router();

//router.get('/', controller.listar);         // listar (admite ?estado=...)
//router.get('/:id', controller.obtener);     // obtener un pedido por id
//router.post('/', controller.crear);         // crear un pedido
//router.put('/:id', controller.actualizar);  // actualizar un pedido completo
//router.delete('/:id', controller.eliminar); // eliminar un pedido

//module.exports = router;

const express = require('express');
const controller = require('../controllers/pedidos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = express.Router();

router.use(verificarToken); // todas las rutas de pedidos exigen token

router.get('/', controller.listar);        // cualquier rol autenticado
router.get('/:id', controller.obtener);    // cualquier rol autenticado
router.post('/', requiereRol('administrador', 'comercial'), controller.crear);
router.put('/:id', requiereRol('administrador', 'comercial'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'comercial'), controller.eliminar);

module.exports = router;