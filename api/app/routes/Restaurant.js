const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { login } = require('../controllers/LoginRestaurant');
const {
    registrarRestaurante,
    obtenerRestaurantes,
    obtenerRestaurante,
    actualizarPropiedadRestaurante,
    suspenderRestaurante,
    eliminarRestaurante,
    actualizarEstatusRestaurante,
    rateRestaurant
} = require('../controllers/Restaurant');

router.post('/restaurant', registrarRestaurante);
router.get('/restaurants', obtenerRestaurantes);
router.get('/restaurant/:id', obtenerRestaurante);
router.put('/restaurant/:id', actualizarPropiedadRestaurante);
router.put('/restaurant-suspender/:id', suspenderRestaurante);
router.delete('/restaurant/:id', eliminarRestaurante);
router.put('/restaurant-estatus/:id', actualizarEstatusRestaurante);
router.post('/restaurant-calificar/:restaurantId', rateRestaurant);

router.post('/restaurant-login', login);

// Ruta para servir imágenes estáticas desde la carpeta de uploads
router.use('/uploads', express.static(path.join(__dirname, '../app/uploads')));

// Ruta para listar todos los archivos subidos en la carpeta de uploads
router.get('/uploads/list', (req, res) => {
    const uploadsDir = path.join(__dirname, '../app/uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer la carpeta de uploads' });
        }
        res.status(200).json(files);
    });
});

module.exports = router;
