// ../controllers/LoginAdmin.js

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const admin = await Admin.findOne({ correo: correo });
        if (!admin) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        const checkPassword = await Admin.comparePassword(password, admin.password);

        if (!checkPassword) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        const token = jwt.sign({ id: admin._id }, process.env.DB_KEY, { expiresIn: '1d' });
        res.json({ token: token, admin: admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
