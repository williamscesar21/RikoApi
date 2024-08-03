// ../controllers/restaurant.js
const Restaurant = require('../models/Restaurant');

// Controlador para registrar un restaurante
const registrarRestaurante = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const {
            nombre,
            descripcion,
            calificaciones,
            images,
            ubicacion,
            horario_de_trabajo,
            menu,
            telefono,
            email,
            password
        } = req.body;

        // Validar si el restaurante ya existe con el mismo email o teléfono
        const emailExistente = await Restaurant.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const telefonoExistente = await Restaurant.findOne({ telefono });
        if (telefonoExistente) {
            return res.status(400).json({ message: 'El teléfono ya está registrado' });
        }

        // Encriptar la contraseña
        const contraseñaEncriptada = await Restaurant.encryptPassword(password);

        // Crear un nuevo documento de restaurante
        const nuevoRestaurante = new Restaurant({
            nombre,
            descripcion,
            calificacion: { calificaciones: calificaciones || [], promedio: 0 },
            images,
            ubicacion,
            horario_de_trabajo,
            menu,
            telefono,
            email,
            password: contraseñaEncriptada
        });

        // Guardar el restaurante en la base de datos
        await nuevoRestaurante.save();

        // Responder con el restaurante creado
        res.status(201).json({ message: 'Restaurante registrado exitosamente', data: nuevoRestaurante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el restaurante', error: error.message });
    }
};

const obtenerRestaurantes = async (req, res) => {
    try {
        const restaurantes = await Restaurant.find();
        return res.status(200).json(restaurantes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const obtenerRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurante = await Restaurant.findById(id);
        return res.status(200).json(restaurante);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarPropiedadRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const { propiedad, valor } = req.body;
        const restaurante = await Restaurant.findByIdAndUpdate(id, { [propiedad]: valor }, { new: true });
        return res.status(200).json(restaurante);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const suspenderRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurante = await Restaurant.findByIdAndUpdate(id, { suspendido: true }, { new: true });
        return res.status(200).json(restaurante);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const eliminarRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurante = await Restaurant.findByIdAndDelete(id);
        return res.status(200).json(restaurante);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarEstatusRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus } = req.body;
        const restaurante = await Restaurant.findByIdAndUpdate(id, { estatus }, { new: true });
        return res.status(200).json(restaurante);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const rateRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    try {
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        restaurant.calificacion.calificaciones.push(rating);
        restaurant.calificacion.promedio = restaurant.calificacion.calificaciones.reduce((a, b) => a + b, 0) / restaurant.calificacion.calificaciones.length;

        await restaurant.save();

        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    registrarRestaurante,
    obtenerRestaurantes,
    obtenerRestaurante,
    actualizarPropiedadRestaurante,
    suspenderRestaurante,
    eliminarRestaurante,
    actualizarEstatusRestaurante,
    rateRestaurant
};
