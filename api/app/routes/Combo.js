const express = require('express');
const router = express.Router();
const {
    createCombo,
    getCombos,
    getComboById,
    updateCombo,
    deleteCombo,
    rateCombo
} = require('../controllers/Combo');

router.post('/combo', createCombo);
router.get('/combos', getCombos);
router.get('/combo/:id', getComboById);
router.put('/combo/:id', updateCombo);
router.delete('/combo/:id', deleteCombo);
router.post('/combo-calificar/:comboId', rateCombo);

module.exports = router;