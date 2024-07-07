// ../controllers/combo.js

const Combo = require('../models/Combo');
const Restaurant = require('../models/Restaurant');

// Crear un nuevo combo
const createCombo = async (req, res) => {
    const { nombre, precio, productos, imagenes, descripcion, calificacion, id_restaurant } = req.body;

    try {
        // Verificar si el restaurante existe
        const restaurant = await Restaurant.findById(id_restaurant);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        // Crear el nuevo combo
        const combo = new Combo({
            nombre,
            precio,
            productos,
            imagenes,
            descripcion,
            calificacion,
            id_restaurant
        });

        await combo.save();
        res.status(201).json(combo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// El JSON para crear un combo es de la siguiente forma:
// {
//     "nombre": "Combo 1",
//     "precio": 10,
//     "productos": [
//         {
//             "id": "1",
//             "quantity": 2
//         },
//         {
//             "id": "2",
//             "quantity": 1
//         }
//     ],
//     "imagenes": [
//         "https://example.com/image1.jpg",
//         "https://example.com/image2.jpg"
//     ],
//     "descripcion": "Descripción del combo",
//     "calificacion": 0,
//     "id_restaurant": "1"
// }


// Obtener todos los combos
const getCombos = async (req, res) => {
    try {
        const combos = await Combo.find().populate('productos.producto').populate('id_restaurant');
        res.json(combos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un combo por ID
const getComboById = async (req, res) => {
    const { id } = req.params;

    try {
        const combo = await Combo.findById(id).populate('productos.producto').populate('id_restaurant');
        if (!combo) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }
        res.json(combo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un combo
const updateCombo = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, productos, imagenes, descripcion, calificacion, id_restaurant } = req.body;

    try {
        // Verificar si el restaurante existe
        const restaurant = await Restaurant.findById(id_restaurant);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        // Actualizar el combo
        const combo = await Combo.findByIdAndUpdate(
            id,
            { nombre, precio, productos, imagenes, descripcion, calificacion, id_restaurant },
            { new: true }
        ).populate('productos.producto').populate('id_restaurant');

        if (!combo) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        res.json(combo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un combo
const deleteCombo = async (req, res) => {
    const { id } = req.params;

    try {
        const combo = await Combo.findByIdAndDelete(id);

        if (!combo) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        res.json({ message: "Combo eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const rateCombo = async (req, res) => {
    const { comboId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    try {
        // Buscar el combo por ID
        const combo = await Combo.findById(comboId);

        if (!combo) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        // Añadir la nueva calificación
        combo.calificacion.calificaciones.push(rating);

        // Calcular el nuevo promedio
        combo.calificacion.promedio = combo.calificacion.calificaciones.reduce((a, b) => a + b, 0) / combo.calificacion.calificaciones.length;

        // Guardar el combo actualizado
        await combo.save();

        res.json(combo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCombo,
    getCombos,
    getComboById,
    updateCombo,
    deleteCombo,
    rateCombo
};
