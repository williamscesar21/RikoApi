// ../controllers/LoginRepartidor.js

const Repartidor = require('../models/Repartidor');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const repartidor = await Repartidor.findOne({ correo: correo });
        if (!repartidor) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        const checkPassword = await Repartidor.comparePassword(password, repartidor.password);

        if (!checkPassword) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        const token = jwt.sign({ id: repartidor._id }, process.env.DB_KEY, { expiresIn: '1d' });
        res.json({ token: token, repartidor: repartidor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
