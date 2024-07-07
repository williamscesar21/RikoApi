// ../controllers/LoginClient.js

const Client = require('../models/Client');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const client = await Client.findOne({ email: correo });

        if (!client) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const checkPassword = await Client.comparePassword(password, client.password);

        if (!checkPassword) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: client._id }, process.env.DB_KEY, { expiresIn: '1d' });
        res.json({ token: token, client: client });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
