// ../models/Combo.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comboSchema = new Schema({
    nombre:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    productos: [{
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        cantidad: {
            type: Number,
            default: 1
        }
    }],
    imagenes:[{
        filename: String,
        contentType: String
    }],
    descripcion:{
        type: String,
        minlenght: 1,
        maxlength: 250,
        required: true
    },
    calificacion: {
        calificaciones: [Number],
        promedio: {
                type: Number,
                default: 
                function () {
                if (this.calificaciones.length > 0) {
                    return this.calificaciones.reduce((a, b) => a + b) / this.calificaciones.length;
                } else {
                    return 0;
                }
            }}
    },
    id_restaurant:{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    },{
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model('Combo', comboSchema);