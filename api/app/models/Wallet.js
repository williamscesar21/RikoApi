// ../models/Wallet.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'userType' // Referencia dinámica basada en el tipo de usuario
    },
    amount: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Pago', 'Retiro', 'Cobro']
    }
},{
    timestamps: true,
    versionKey: false
});

const walletSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'userType' // Referencia dinámica basada en el tipo de usuario
    },
    userType: {
        type: String,
        required: true,
        enum: ['Client', 'Restaurant', 'Repartidor'] // Tipos de usuario válidos
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema]
},{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Wallet', walletSchema);