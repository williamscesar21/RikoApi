const Wallet = require('../models/Wallet');
const Client = require('../models/Client');
const Restaurant = require('../models/Restaurant');
const Repartidor = require('../models/Repartidor');

// Obtener todas las wallets
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
    const { walletId, amount, description } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    try {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet no encontrada" });
        }

        wallet.balance += amount;

        wallet.transactions.push({
            user: wallet.user,
            amount,
            description: description || 'Depósito de fondos',
            type: 'Pago'
        });

        await wallet.save();

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retirar fondos de la wallet
const withdrawFunds = async (req, res) => {
    const { walletId, amount, description } = req.body;

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

        wallet.transactions.push({
            user: wallet.user,
            amount,
            description: description || 'Retiro de fondos',
            type: 'Retiro'
        });

        await wallet.save();

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Realizar una transferencia entre wallets
const transferFunds = async (req, res) => {
    const { fromWalletId, toWalletId, amount, description } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    try {
        const fromWallet = await Wallet.findById(fromWalletId);
        const toWallet = await Wallet.findById(toWalletId);

        if (!fromWallet || !toWallet) {
            return res.status(404).json({ message: "Una o ambas wallets no fueron encontradas" });
        }

        if (fromWallet.balance < amount) {
            return res.status(400).json({ message: "Fondos insuficientes en la wallet de origen" });
        }

        // Actualizar la wallet de origen
        fromWallet.balance -= amount;
        fromWallet.transactions.push({
            user: fromWallet.user,
            amount: -amount,
            description: description || 'Transferencia de fondos',
            type: 'Retiro'
        });

        // Actualizar la wallet de destino
        toWallet.balance += amount;
        toWallet.transactions.push({
            user: toWallet.user,
            amount,
            description: description || 'Recepción de fondos',
            type: 'Pago'
        });

        await fromWallet.save();
        await toWallet.save();

        res.json({ fromWallet, toWallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Realizar un cobro
const chargeUser = async (req, res) => {
    const { fromWalletId, toWalletId, amount, description } = req.body;

    try {
        const fromWallet = await Wallet.findById(fromWalletId);
        const toWallet = await Wallet.findById(toWalletId);

        if (!fromWallet || !toWallet) {
            return res.status(404).json({ message: "Una o ambas wallets no fueron encontradas" });
        }

        if (fromWallet.balance < amount) {
            return res.status(400).json({ message: "Fondos insuficientes en la wallet del cliente" });
        }

        fromWallet.balance -= amount;
        toWallet.balance += amount;

        fromWallet.transactions.push({
            user: fromWallet.user,
            amount: -amount,
            description: description || 'Cobro realizado',
            type: 'Retiro'
        });

        toWallet.transactions.push({
            user: toWallet.user,
            amount,
            description: description || 'Pago recibido',
            type: 'Cobro'
        });

        await fromWallet.save();
        await toWallet.save();

        res.json({ fromWallet, toWallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener el historial de transacciones de una wallet
const getTransactions = async (req, res) => {
    const { walletId } = req.params;

    try {
        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            return res.status(404).json({ message: "Wallet no encontrada" });
        }

        res.json(wallet.transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createWallet,
    getWalletByUser,
    addFunds,
    withdrawFunds,
    transferFunds,
    chargeUser,
    getTransactions,
    getWallets
};
