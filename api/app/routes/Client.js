const express = require('express');
const router = express.Router();
const { login } = require('../controllers/LoginClient');
const {
    registrarClient,
    obtenerClients,
    obtenerClient,
    actualizarPropiedadClient,
    actualizarEstatusClient,
    actualizarLocationClient,
    suspenderClient,
    eliminarClient
} = require('../controllers/Client')

router.post('/client-login', login)
router.post('/client-registrar', registrarClient)
router.get('/client-obtener', obtenerClients)
router.get('/client-obtener/:id', obtenerClient)
router.put('/client-actualizar-propiedad/:id', actualizarPropiedadClient)
router.put('/client-actualizar-estatus/:id', actualizarEstatusClient)
router.put('/client-actualizar-location/:id', actualizarLocationClient)
router.put('/client-suspender/:id', suspenderClient)
router.delete('/client-eliminar/:id', eliminarClient)

module.exports = router