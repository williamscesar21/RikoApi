// ../controllers/repartisdor.js

const multerMiddleware = require('../middlewares/multerMiddleware');
const Repartidor = require('../models/Repartidor');

const registrarRepartidor = async (req, res) => {
    try {
        // Middleware de Multer para subir los archivos necesarios (foto de perfil y foto del vehículo)
        multerMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // Un error de Multer ocurrió durante la carga
                return res.status(400).json({ error: err.message });
            } else if (err) {
                // Otro tipo de error ocurrió
                return res.status(500).json({ error: err.message });
            }

            // Extraer los datos del cuerpo de la solicitud y los archivos subidos
            const { nombre, apellido, email, telefono, password, location, calificacion, vehiculo } = req.body;
            const { foto_perfil, foto_vehiculo } = req.file ? req.file : {};

            // Validar que todos los campos necesarios estén presentes
            if (!nombre || !apellido || !email || !telefono || !password || !location || !calificacion || !vehiculo.matricula || !vehiculo.marca || !vehiculo.modelo || !vehiculo.color) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            // Crear una instancia del repartidor con los datos proporcionados
            const repartidor = await Repartidor.create({
                nombre,
                apellido,
                email,
                telefono,
                password: await Repartidor.encryptPassword(password),
                location,
                calificacion,
                foto_perfil: foto_perfil ? { filename: foto_perfil.filename, contentType: foto_perfil.mimetype } : undefined,
                vehiculo: {
                    matricula: vehiculo.matricula,
                    marca: vehiculo.marca,
                    modelo: vehiculo.modelo,
                    color: vehiculo.color,
                    foto_vehiculo: foto_vehiculo ? { filename: foto_vehiculo.filename, contentType: foto_vehiculo.mimetype } : undefined
                }
            });

            // Encriptar la contraseña antes de guardarla en la base de datos
            repartidor.password = await Repartidor.encryptPassword(repartidor.password);

            // Guardar el repartidor en la base de datos
            await repartidor.save();

            return res.status(201).json({ message: 'Repartidor registrado exitosamente', repartidor });
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// EL JSON PARA CREAR REPARTIDOR ES DE LA SIGUIENTE FORMA:
// {
//     "nombre": "Jorge",
//     "apellido": "Perez",
//     "email": "jorge@perez",
//     "password": "123456",
//     "telefono": "1234567890",
//     "location": "40.7128,-74.0060",
//     "calificacion": 4.5,
//     "vehiculo": {
//         "matricula": "ABC123",
//         "marca": "Toyota",
//         "modelo": "Camry",
//         "color": "Rojo",
//         "fotos_vehiculo": [
//             {
//                 "filename": "imagen.jpg",
//                 "contentType": "image/jpeg"
//             }
//         ]
//     }
// }

const obtenerRepartidores = async (req, res) => {
    try {
        const repartidores = await Repartidor.find();
        return res.status(200).json(repartidores);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const obtenerRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findById(id);
        return res.status(200).json(repartidor);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarPropiedadRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { propiedad, valor } = req.body;
        const repartidor = await Repartidor.findByIdAndUpdate(id, { [propiedad]: valor }, { new: true });
        return res.status(200).json(repartidor);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const eliminarRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findByIdAndDelete(id);
        return res.status(200).json(repartidor);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const suspenderRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findByIdAndUpdate(id, { suspendido: true }, { new: true });
        return res.status(200).json(repartidor);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarLocationRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        const location = `${lat},${lng}`;
        if (!/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(location)) {
            return res.status(400).json({ error: 'La ubicación proporcionada es inválida' });
        }
        const repartidor = await Repartidor.findByIdAndUpdate(id, { location }, { new: true });
        if (!repartidor) {
            return res.status(404).json({ error: 'Repartidor no encontrado' });
        }
        return res.status(200).json(repartidor);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const rateRepartidor = async (req, res) => {
    const { repartidorId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    try {
        // Buscar el repartidor por ID
        const repartidor = await Repartidor.findById(repartidorId);

        if (!repartidor) {
            return res.status(404).json({ message: "repartidor no encontrado" });
        }

        // Añadir la nueva calificación
        repartidor.calificacion.calificaciones.push(rating);

        // Calcular el nuevo promedio
        repartidor.calificacion.promedio = repartidor.calificacion.calificaciones.reduce((a, b) => a + b, 0) / repartidor.calificacion.calificaciones.length;

        // Guardar el repartidor actualizado
        await repartidor.save();

        res.json(repartidor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 
module.exports = {
    registrarRepartidor,
    obtenerRepartidores,
    obtenerRepartidor,
    actualizarPropiedadRepartidor,
    eliminarRepartidor,
    suspenderRepartidor,
    actualizarLocationRepartidor,
    rateRepartidor
};
