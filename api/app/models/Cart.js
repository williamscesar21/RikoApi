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
cartSchema.methods.calculateTotal = async function() {
    let total = 0;

    for (let item of this.items) {
        // Cargar el producto asociado al item del carrito
        const product = await mongoose.model('Product').findById(item.product).exec();
        
        if (product && product.precio) {
            total += product.precio * item.quantity;
        } else {
            throw new Error(`Producto no válido o sin precio: ${item.product}`);
        }
    }

    this.total = total;
    return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
