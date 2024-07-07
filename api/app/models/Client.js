// ../models/Client.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const clientSchema = new Schema({
    nombre:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        require: true,
        validate: { //Validación de solo letras en el nombre
            validator: function (value) {
              return /[a-zA-Z]/.test(value);
            },
            message: 'Nombre inválido',
          },
    },
    apellido:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        require: true,
        validate: { //Validación de solo letras en el apellido
            validator: function (value) {
              return /[a-zA-Z]/.test(value);
            },
            message: 'Apellido inválido',
          },
    },
    email:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        require: true,
        unique: true,
        validate: { //Validación de email
            validator: function (value) {
              return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
            },
            message: 'Email inválido',
          },
    },
    telefono:{
        type: String,
        require: true,
        unique: true,
        length: 11,
        validate: { //Validación de telefono
            validator: function (value) {
              return /^\d{11}$/.test(value);
            },
            message: 'Telefón inválido',
          }
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
    location:{
        type: String,
        require: false,
        validate: { //Validación de la ubicación (latitud y longitud (Ejemplo: -12.046110, -77.042778))
            validator: function (value) {
              return /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value);
            },
            message: 'Ubicación inválida',
          }
    },
    suspendido:{
        type: Boolean,
        default: false
    },
    estatus:{
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    }
},{
    timestamps: true,
    versionKey: false 
} )

clientSchema.statics.comparePassword = async function(Password, hashedPassword) {
    try {
        return await bcrypt.compare(Password, hashedPassword);
    } catch (error) {
        throw new Error(error);
    }
};


clientSchema.statics.encryptPassword = async (clave) => {
    if (!clave) {
        throw new Error('La contraseña es requerida');
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}

module.exports = mongoose.model('Client', clientSchema)