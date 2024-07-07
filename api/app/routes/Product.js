const express = require('express');
const router = express.Router();
const {
    crearProducto,
    obtenerProducts,
    obtenerProduct,
    eliminarProduct,
    suspenderProduct,
    actualizarProduct,
    actualizarEstatusProduct,
    rateProduct
} = require('../controllers/Product');

router.post('/product', crearProducto);
router.get('/product', obtenerProducts);
router.get('/product/:id', obtenerProduct); 
router.delete('/product/:id', eliminarProduct); 
router.put('/product-suspender/:id', suspenderProduct);
router.put('/product/:id', actualizarProduct); 
router.put('/product-estatus/:id', actualizarEstatusProduct);
router.post('/product-calificar/:productId', rateProduct);

module.exports = router;
