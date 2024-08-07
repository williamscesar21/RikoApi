// ../models/Product.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
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
    images:{
        type: [String],
        default: []
    },
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
    tags:{
        type:[String],
        validate:{
            validator: function (v) {
                return v.length <= 3; // Validar que no haya más de 3 tags seleccionados
            },
            message: 'No se pueden seleccionar más de 3 tags'
        },
        default: []
    },
    estatus:{
        type: String,
        enum: ['Disponible', 'No Disponible'],
        default: 'Disponible'
    },
    suspendido:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Product', productSchema);