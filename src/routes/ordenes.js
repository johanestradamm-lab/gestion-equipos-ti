const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');

router.get('/', ordenesController.obtenerOrdenes);
router.post('/', ordenesController.crearOrden);
router.put('/:id', ordenesController.actualizarOrden);
router.delete('/:id', ordenesController.eliminarOrden);

module.exports = router;