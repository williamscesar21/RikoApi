const multer = require('multer');
const Restaurant = require('../models/Restaurant');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const { promisify } = require('util');

// Cargar las credenciales de la cuenta de servicio de Google Drive
const credentials = require('../../config/primal-chariot-429516-n4-aae5e6c89dfc.json');

// Crear un cliente OAuth2 para autorización
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

// Crear una instancia del cliente de Google Drive
const drive = google.drive({ version: 'v3', auth });

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
}).single('images');

const registrarRestaurante = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }

        try {
            const { nombre, descripcion, ubicacion, telefono, email, password, suspendido, horario_de_trabajo } = req.body;

            let horarios = [];
            if (typeof horario_de_trabajo === 'string') {
                horarios = JSON.parse(horario_de_trabajo).map(item => ({
                    dia: item.dia,
                    inicio: item.inicio,
                    fin: item.fin
                }));
            } else {
                horarios = horario_de_trabajo.map(item => ({
                    dia: item.dia,
                    inicio: item.inicio,
                    fin: item.fin
                }));
            }

            if (!nombre || !descripcion || !ubicacion || !telefono || !email || !password || suspendido === undefined) {
                return res.status(400).json({ error: 'Faltan datos requeridos' });
            }

            // Subir archivo a Google Drive
            const fileMetadata = {
                name: `${Date.now()}_${req.file.originalname}`,
                mimeType: req.file.mimetype
            };

            const media = {
                mimeType: req.file.mimetype,
                body: req.file.buffer
            };

            const driveResponse = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });

            const fileId = driveResponse.data.id;

            const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

            const restaurante = new Restaurant({
                nombre,
                descripcion,
                ubicacion,
                horario_de_trabajo: horarios,
                telefono,
                email,
                password: await Restaurant.encryptPassword(password),
                images: [{
                    filename: fileMetadata.name,
                    contentType: req.file.mimetype,
                    url: fileUrl
                }],
                suspendido
            });

            await restaurante.save();

            return res.status(201).json({ message: 'Restaurante registrado exitosamente', restaurante });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
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
