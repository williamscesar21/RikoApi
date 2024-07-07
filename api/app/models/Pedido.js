// ../models/Pedido.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
    id_repartidor:{
        type: Schema.Types.ObjectId,
        ref: 'Repartidor'
    },
    id_client:{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    id_restaurant:{
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    estado:{
        type: String,
        enum: ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'],
        default: 'Pendiente'
    },
    fecha_apertura:{
        type: Date,
        default: Date.now
    },
    fecha_cierre:{
        type: Date
    },
    direccion_de_entrega:{
        type: String,
        require: true,
        validate: { //Validación de la ubicación (latitud y longitud)
            validator: function (value) {
              return /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value);
            },
            message: 'Ubicación inválida',
          }
    },
    calificacion:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        require: true,
        validate: {
            validator: function (v) {
                return /^[0-5]+$/.test(v);
            },
            message: 'Calificación inválida',
          }
        },
    detalles:{
        id_producto:{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        id_combo:{
            type: Schema.Types.ObjectId,
            ref: 'Combo'
        },
        cantidad:{
            type: Number
        }
    },
    total:{
        type: Number
    }
},{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Pédido', pedidoSchema)