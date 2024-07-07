// ../models/Wallet.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    }
},{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Wallet', walletSchema);