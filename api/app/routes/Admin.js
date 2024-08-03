//routes/admin.js

const express = require('express');
const router = express.Router();
const {registrarAdmin, eliminarAdmin} = require('../controllers/Admin');

router.post('/admin', registrarAdmin);
router.delete('/admin/:id', eliminarAdmin);

module.exports = router