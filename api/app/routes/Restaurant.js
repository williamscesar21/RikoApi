const express = require('express');
const router = express.Router();
const {login} = require('../controllers/LoginRestaurant');
const {
    registrarRestaurante,
    obtenerRestaurantes,
    obtenerRestaurante,
    actualizarPropiedadRestaurante,
    suspenderRestaurante,
    eliminarRestaurante,
    actualizarEstatusRestaurante,
    rateRestaurant,
    updatePassword
} = require('../controllers/Restaurant');

router.post('/restaurant-login', login);

router.post('/restaurant', registrarRestaurante);
router.get('/restaurants', obtenerRestaurantes);
router.get('/restaurant/:id', obtenerRestaurante);
router.put('/restaurant/:id', actualizarPropiedadRestaurante);
router.put('/restaurant-suspender/:id', suspenderRestaurante);
router.delete('/restaurant/:id', eliminarRestaurante);
router.put('/restaurant-estatus/:id', actualizarEstatusRestaurante);
router.post('/restaurant-calificar/:restaurantId', rateRestaurant);

router.put('/restaurant-password/:id', updatePassword);

module.exports = router;
