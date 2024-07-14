// ../controllers/restaurant.js
const Restaurant = require('../models/Restaurant');
const multer = require('multer');
const multerMiddleware = require('../middlewares/multerMiddleware');

// Controlador para registrar un restaurante
const registrarRestaurante = async (req, res) => {
    try {
        // Middleware de Multer para subir los archivos de imagen (logo y foto del establecimiento)
        multerMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // Un error de Multer ocurrió durante la carga
                return res.status(400).json({ error: err.message });
            } else if (err) {
                // Otro tipo de error ocurrió
                return res.status(500).json({ error: err.message });
            }

            // Extraer los datos del cuerpo de la solicitud y los archivos subidos
            const { nombre, descripcion, ubicacion, telefono, email, password, inicio, fin, calificacion, estatus, suspendido } = req.body;
            const { logo, foto_establecimiento } = req.file ? req.file : {};

            // Extraer y parsear el horario de trabajo del cuerpo de la solicitud
            const horario_de_trabajo = req.body.horario_de_trabajo;
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

            // Validar que todos los campos necesarios estén presentes
            if (!nombre || !descripcion || !ubicacion || !telefono || !email || !password || !inicio || !fin || !calificacion || !estatus || suspendido === undefined) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            // Crear una instancia del restaurante con los datos proporcionados
            const restaurante = new Restaurant({
                nombre,
                descripcion,
                ubicacion,
                horario_de_trabajo: horarios,
                telefono,
                email,
                password: await Restaurant.encryptPassword(password),
                inicio,
                fin,
                logo: { filename: logo.filename, contentType: logo.mimetype },
                foto_establecimiento: { filename: foto_establecimiento.filename, contentType: foto_establecimiento.mimetype },
                calificacion,
                estatus,
                suspendido
            });

            // Guardar el restaurante en la base de datos
            await restaurante.save();

            return res.status(201).json({ message: 'Restaurante registrado exitosamente', restaurante });
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// EL JSON PARA CREAR RESTAURANTE ES DE LA SIGUIENTE FORMA:
// {
//     "nombre": "Jorge",
//     "apellido": "Perez",
//     "email": "jorge@perez",
//     "password": "123456",
//     "telefono": "1234567890",
//     "location": "40.7128,-74.0060",
//     "horario_de_trabajo": [
//         {
//             "dia": "Lunes",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },
//         {
//             "dia": "Martes",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },
//         {
//             "dia": "Miercoles",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },   
//         {
//             "dia": "Jueves",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },
//         {
//             "dia": "Viernes",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },
//         {
//             "dia": "Sabado",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         },
//         {
//             "dia": "Domingo",
//             "inicio": "10:00:00",
//             "fin": "22:00:00"
//         }
//     ]
// }


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
        // Buscar el restaurante por ID
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        // Añadir la nueva calificación
        restaurant.calificacion.calificaciones.push(rating);

        // Calcular el nuevo promedio
        restaurant.calificacion.promedio = restaurant.calificacion.calificaciones.reduce((a, b) => a + b, 0) / restaurant.calificacion.calificaciones.length;

        // Guardar el Restaurante actualizado
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
