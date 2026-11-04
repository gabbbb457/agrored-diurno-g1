// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');

const router = Router();

router.get('/', controller.listar);          // listar (admite ?ciudad=... y ?ids=1,2,3)
router.get('/:id', controller.obtener);      // obtener un cliente por id
router.post('/', controller.crear);          // crear un cliente
router.put('/:id', controller.actualizar);   // reemplazar un cliente completo
router.delete('/:id', controller.eliminar);  // eliminar un cliente

module.exports = router;
