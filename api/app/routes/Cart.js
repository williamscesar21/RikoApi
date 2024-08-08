const express = require('express');
const router = express.Router();
const {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity
} = require('../controllers/Cart');

router.get('/cart/:Idclient', getCart);
router.post('/add', addItemToCart);
router.post('/cart/remove', removeItemFromCart);
router.put('/cart/update', updateItemQuantity);

module.exports = router;
