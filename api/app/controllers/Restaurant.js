// ../controllers/restaurant.js
const Restaurant = require('../models/Restaurant');
const multer = require('multer');
const { bucket } = require('../../../firebaseConfig'); // Importa el bucket de Firebase

// Controlador para registrar un restaurante
const registrarRestaurante = async (req, res) => {
    try {
        multerMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: err.message });
            }

            const { nombre, descripcion, ubicacion, telefono, email, password, horario_de_trabajo } = req.body;
            const { logo, foto_establecimiento } = req.files || {};

            if (!nombre || !descripcion || !ubicacion || !telefono || !email || !password || !horario_de_trabajo) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            const horarios = JSON.parse(horario_de_trabajo).map(item => ({
                dia: item.dia,
                inicio: item.inicio,
                fin: item.fin
            }));

            const uploadToFirebase = async (file) => {
                if (!file) return null;
                
                const blob = bucket.file(Date.now() + '-' + file.originalname);
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                return new Promise((resolve, reject) => {
                    blobStream.on('error', err => reject(err));
                    blobStream.on('finish', () => {
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                        resolve(publicUrl);
                    });
                    blobStream.end(file.buffer);
                });
            };

            const logoUrl = await uploadToFirebase(logo[0]);
            const fotoEstablecimientoUrl = await uploadToFirebase(foto_establecimiento[0]);

            const hashedPassword = await Restaurant.encryptPassword(password);

            const restaurante = new Restaurant({
                nombre,
                descripcion,
                ubicacion,
                horario_de_trabajo: horarios,
                telefono,
                email,
                password: hashedPassword,
                images: [
                    logoUrl ? { filename: logoUrl, contentType: logo[0].mimetype } : undefined,
                    fotoEstablecimientoUrl ? { filename: fotoEstablecimientoUrl, contentType: foto_establecimiento[0].mimetype } : undefined
                ].filter(Boolean)
            });

            await restaurante.save();
            return res.status(201).json({ message: 'Restaurante registrado exitosamente', restaurante });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
