// ../controllers/restaurant.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Restaurant = require('../models/Restaurant');

// Controlador para registrar un restaurante
// Función para generar un nombre único para el archivo
const generarNombreArchivo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}-${random}`;
};

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define el directorio donde se guardarán los archivos
        const uploadDir = path.join(__dirname, '../uploads/');
        
        // Verificar si el directorio existe, si no, crearlo
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar un nombre único para el archivo
        const nombreArchivo = generarNombreArchivo();
        cb(null, nombreArchivo + path.extname(file.originalname));
    }
});

// Middleware de Multer
const upload = multer({ 
    storage: storage,
    limits: {
        // Limita el tamaño del archivo a 5MB
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: function (req, file, cb) {
        // Solo acepta archivos de imagen
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
}).single('images'); // Asegúrate de que el nombre del campo coincida con el del formulario

const registrarRestaurante = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // Un error de Multer ocurrió durante la carga
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // Otro tipo de error ocurrió
            return res.status(500).json({ error: err.message });
        }

        try {
            // Extraer los datos del cuerpo de la solicitud y los archivos subidos
            const { nombre, descripcion, ubicacion, telefono, email, password, calificacion, estatus, suspendido, horario_de_trabajo } = req.body;

            // Extraer y parsear el horario de trabajo del cuerpo de la solicitud
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
            if (!nombre || !descripcion || !ubicacion || !telefono || !email || !password || !calificacion || !estatus || suspendido === undefined) {
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
                images: req.file ? [{ 
                    filename: req.file.filename, 
                    contentType: req.file.mimetype 
                }] : [],
                calificacion: {
                    calificaciones: calificacion,
                    promedio: calificacion.reduce((a, b) => a + b) / calificacion.length
                },
                estatus,
                suspendido
            });

            // Guardar el restaurante en la base de datos
            await restaurante.save();

            return res.status(201).json({ message: 'Restaurante registrado exitosamente', restaurante });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
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
