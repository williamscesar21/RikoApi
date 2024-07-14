const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const horarioSchema = new Schema({
    dia: {
        type: String,
        enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
        required: true
    },
    inicio: {
        type: String,
        match: /^[0-9]+:[0-9]+$/
    },
    fin: {
        type: String,
        match: /^[0-9]+:[0-9]+$/
    }
});

const restaurantSchema = new Schema({
    nombre: {
        type: String,
        minlength: 1,
        maxlength: 100,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Nombre inválido',
        }
    },
    descripcion: {
        type: String,
        minlength: 1,
        maxlength: 100,
        required: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Descripción inválida',
        }
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
    logo: {
        filename: String,
        contentType: String
    },
    ubicacion: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(v);
            },
            message: 'Ubicación inválida',
        }
    },
    horario_de_trabajo: {
        type: [horarioSchema],
        validate: {
            validator: function (horarios) {
                // Validar que cada día de la semana tenga un horario válido
                const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
                for (const horario of horarios) {
                    if (!diasValidos.includes(horario.dia) || !horario.inicio || !horario.fin) {
                        return false;
                    }
                }
                return true;
            },
            message: 'Horario inválido',
        }
    },
    menu: [{
        tipo: {
            type: String,
            enum: ['Producto', 'Combo']
        },
        item: {
            type: Schema.Types.ObjectId,
            refPath: 'menu.tipo'
        }
    }],
    estatus: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: function () {
            const ahora = new Date();
            const diaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
            const horarioActual = this.horario_de_trabajo.find(horario => horario.dia === diaActual);
            if (!horarioActual) {
                return 'Inactivo';
            }
    
            const inicioMinutos = horarioActual.inicioHora * 60 + horarioActual.inicioMinuto;
            const finMinutos = horarioActual.finHora * 60 + horarioActual.finMinuto;
    
            if (inicioMinutos <= horaActual && horaActual <= finMinutos) {
                return 'Activo';
            } else {
                return 'Inactivo';
            }
        }
    },    
    telefono: {
        type: String,
        required: true,
        unique: true,
        minlength: 11,
        validate: {
            validator: function (value) {
                return /^\d{11}$/.test(value);
            },
            message: 'Teléfono inválido',
        }
    },
    email: {
        type: String,
        minlength: 1,
        maxlength: 100,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
            },
            message: 'Email inválido',
        },
    },
    password:{
        type: String,
        maxLenght: [50, 'La contraseña no puede superar los 50 caracteres'],
        minLenght: [6, 'La contraseña no puede ser menor de 6 caracteres'],
        required: true,
        validate: { //Validación de la clave para que contenga mínimo 8 caracatéres, una letra mayúscula, una letra minúscula, y un caracter especial.
            validator: function (value) {
              return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(value);
            },
            message: 'Contraseña debe presentar minimo 8 caracteres, una letra mayúscula, una letra minúscula, un caracter especial y un dígito',
        }
    },
    foto_establecimiento: {
        filename: String,
        contentType: String
    },
    suspendido: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

restaurantSchema.statics.comparePassword = async function (Password, hashedPassword) {
    try {
        return await bcrypt.compare(Password, hashedPassword);
    } catch (error) {
        throw new Error(error);
    }
};

restaurantSchema.statics.encryptPassword = async (clave) => {
    if (!clave) {
        throw new Error('La contraseña es requerida');
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
