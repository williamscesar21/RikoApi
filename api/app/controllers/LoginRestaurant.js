// ../controllers/LoginRestaurant.js

const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const restaurant = await Restaurant.findOne({ correo: correo });
        if (!restaurant) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        const checkPassword = await Restaurant.comparePassword(password, restaurant.password);

        if (!checkPassword) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        const token = jwt.sign({ id: restaurant._id }, process.env.DB_KEY, { expiresIn: '1d' });
        res.json({ token: token, restaurant: restaurant });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login };
