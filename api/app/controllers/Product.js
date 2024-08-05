// ../controllers/Product.js
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');

const crearProducto = async (req, res) => {
    try {
            // Extraer los datos del cuerpo de la solicitud y las imágenes subidas
            const { nombre, precio, descripcion, calificaciones, id_restaurant, tags, images } = req.body;

            // Validar que todos los campos necesarios estén presentes
            if (!nombre || !precio || !descripcion || !id_restaurant || !tags || !images) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }

            // Crear una instancia del producto con los datos proporcionados
            const producto = new Product({
                nombre,
                precio,
                descripcion,
                calificacion: { calificaciones: calificaciones || [], promedio: 0 },
                id_restaurant,
                tags,
                images
            });

            // Guardar el producto en la base de datos
            await producto.save();

            // Actualizar el campo menu del restaurante
            await actualizarMenuRestaurante(id_restaurant, 'Producto', producto._id);

            return res.status(201).json({ message: 'Producto creado exitosamente', producto });
        ;

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// EL JSON PARA CREAR PRODUCT ES DE LA SIGUIENTE FORMA:
// {
//     "nombre": "Hamburguesa",
//     "precio": 9.99,
//     "descripcion": "Hamburguesa clasica",
//     "calificacion": 4.5,
//     "id_restaurant": "62b9d0e6f5a4c8e8f8f8f8f",
//     "tags": ["hamburguesa", "clasica", "carne", "lata"]
// }

// Función para actualizar el campo menu del restaurante
const actualizarMenuRestaurante = async (restauranteId, tipo, itemId) => {
    try {
        // Encontrar y actualizar el restaurante
        await Restaurant.findByIdAndUpdate(restauranteId, { $push: { menu: { tipo, item: itemId } } });
    } catch (error) {
        throw new Error(error.message);
    }
};

const obtenerProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const obtenerProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const eliminarProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const suspenderProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, { suspendido: true }, { new: true });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const actualizarProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const actualizarEstatusProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus } = req.body;
        const product = await Product.findByIdAndUpdate(id, { estatus }, { new: true });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const rateProduct = async (req, res) => {
    const { productId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    try {
        // Buscar el producto por ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Añadir la nueva calificación
        product.calificacion.calificaciones.push(rating);

        // Calcular el nuevo promedio
        product.calificacion.promedio = product.calificacion.calificaciones.reduce((a, b) => a + b, 0) / product.calificacion.calificaciones.length;

        // Guardar el producto actualizado
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    crearProducto,
    obtenerProducts,
    obtenerProduct,
    eliminarProduct,
    suspenderProduct,
    actualizarProduct,
    actualizarEstatusProduct,
    rateProduct
}