// ../controllers/cart.js

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Obtener el carrito del cliente
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ id_client: req.client.id }).populate('items.product');

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Añadir un producto al carrito
const addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        let cart = await Cart.findOne({ id_client: req.client.id });

        if (!cart) {
            cart = new Cart({ id_client: req.client.id, items: [] });
        }

        const cartItem = cart.items.find(item => item.product.toString() === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.calculateTotal();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un producto del carrito
const removeItemFromCart = async (req, res) => {
    const { productId } = req.body;

    try {
        let cart = await Cart.findOne({ id_client: req.client.id });

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.calculateTotal();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar la cantidad de un producto en el carrito
const updateItemQuantity = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ id_client: req.client.id });

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const cartItem = cart.items.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        cartItem.quantity = quantity;
        await cart.calculateTotal();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity
};
