const express = require('express');
const router = express.Router();
const { login } = require('../controllers/LoginRepartidor');
const {
    registrarRepartidor,
    obtenerRepartidores,
    obtenerRepartidor,
    actualizarPropiedadRepartidor,
    eliminarRepartidor,
    suspenderRepartidor,
    actualizarLocationRepartidor,
    rateRepartidor,
    updatePassword
} = require('../controllers/Repartidor');

router.post('/repartidor', registrarRepartidor);
router.get('/repartidor', obtenerRepartidores);
router.get('/repartidor/:id', obtenerRepartidor);
router.put('/repartidor/:id', actualizarPropiedadRepartidor);
router.delete('/repartidor/:id', eliminarRepartidor);
router.put('/repartidor-suspender/:id', suspenderRepartidor);
router.put('/repartidor-location/:id', actualizarLocationRepartidor);
router.post('/repartidor-calificar/:repartidorId', rateRepartidor);

router.put('/repartidor-password/:id', updatePassword);

router.post('/repartidor-login', login);

module.exports = router;
