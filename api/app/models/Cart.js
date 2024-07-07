const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const cartSchema = new Schema({
    id_client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// Método para calcular el total del carrito
cartSchema.methods.calculateTotal = function() {
    // Inicializar total
    let total = 0;

    // Iterar sobre los items del carrito
    this.items.forEach(item => {
        total += item.product.precio * item.quantity; // Asumiendo que `precio` es el precio del producto
    });

    // Asignar el total calculado al campo total del carrito
    this.total = total;

    // Guardar el carrito
    return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
