// ../controllers/wallet.js

const Wallet = require('../models/Wallet');
const Client = require('../models/Client');
const Restaurant = require('../models/Restaurant');
const Repartidor = require('../models/Repartidor');

//Obtener todas las wallets
const getWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find();
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva wallet
const createWallet = async (req, res) => {
    const { user, userType } = req.body;

    try {
        // Verificar si el usuario existe y es del tipo correcto
        let userExists;
        switch (userType) {
            case 'Client':
                userExists = await Client.findById(user);
                break;
            case 'Restaurant':
                userExists = await Restaurant.findById(user);
                break;
            case 'Repartidor':
                userExists = await Repartidor.findById(user);
                break;
            default:
                return res.status(400).json({ message: "Tipo de usuario no válido" });
        }

        if (!userExists) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Crear la wallet
        const wallet = new Wallet({ user, userType });
        await wallet.save();

        res.status(201).json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener wallets por usuario
const getWalletByUser = async (req, res) => {
    const { user, userType } = req.params;

    try {
        const wallets = await Wallet.find({ user, userType });
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Añadir fondos a la wallet
const addFunds = async (req, res) => {
    const { walletId, amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    try {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet no encontrada" });
        }

        wallet.balance += amount;
        await wallet.save();

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retirar fondos de la wallet
const withdrawFunds = async (req, res) => {
    const { walletId, amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    try {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet no encontrada" });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ message: "Fondos insuficientes" });
        }

        wallet.balance -= amount;
        await wallet.save();

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createWallet,
    getWalletByUser,
    addFunds,
    withdrawFunds
};
