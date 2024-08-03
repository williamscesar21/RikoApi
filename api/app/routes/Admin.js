//routes/admin.js

const express = require('express');
const router = express.Router();
const {registrarAdmin, eliminarAdmin} = require('../controllers/Admin');
const {login} = require('../controllers/LoginAdmin');

router.post('/admin', registrarAdmin);
router.delete('/admin/:id', eliminarAdmin);

router.post('/admin-login', login);

module.exports = router