// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/productos.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los productos
router.get('/:id', controller.obtener);  // obtener un producto por id
router.post('/', controller.crear);      // crear un producto
router.put('/:id', controller.actualizar);   // reemplazar un producto
router.delete('/:id', controller.eliminar);  // eliminar un producto

module.exports = router;