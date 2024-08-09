const express = require('express');
const router = express.Router();
const {
    getWallets,
    getWalletByUser,
    createWallet,
    withdrawFunds,
    addFunds,
    transferFunds,
    chargeUser,
    getTransactions
} = require('../controllers/Wallet');

// Rutas para manejar las wallets
router.get('/wallets', getWallets); // Obtener todas las wallets
router.get('/wallet/:user/:userType', getWalletByUser); // Obtener wallets por usuario y tipo de usuario

// Rutas para operaciones con una wallet específica
router.post('/wallet', createWallet); // Crear una nueva wallet
router.post('/wallet-withdraw', withdrawFunds); // Retirar fondos de una wallet
router.post('/wallet-add-funds', addFunds); // Añadir fondos a una wallet

// Rutas para transacciones entre wallets
router.post('/wallet-transfer', transferFunds); // Transferir fondos entre wallets
router.post('/wallet-charge', chargeUser); // Realizar un cobro de una wallet a otra

// Ruta para obtener el historial de transacciones de una wallet
router.get('/wallet-transactions/:walletId', getTransactions);

module.exports = router;
