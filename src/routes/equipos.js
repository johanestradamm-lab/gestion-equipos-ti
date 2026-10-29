const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

router.get('/', equiposController.obtenerEquipos);
router.get('/:id', equiposController.obtenerEquipoPorId);
router.post('/', equiposController.crearEquipo);
router.put('/:id', equiposController.actualizarEquipo);
router.delete('/:id', equiposController.eliminarEquipo);

module.exports = router;