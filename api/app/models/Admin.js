// ../models/Admin.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const adminSchema = new Schema({
    username:{
        type: String,
        minlenght: 1,
        maxlength: 100,
        required: true
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
    }
},{
    timestamps: true,
    versionKey: false
});

adminSchema.statics.comparePassword = async function(Password, hashedPassword) {
    try {
        return await bcrypt.compare(Password, hashedPassword);
    } catch (error) {
        throw new Error(error);
    }
};


adminSchema.statics.encryptPassword = async (clave) => {
    if (!clave) {
        throw new Error('La contraseña es requerida');
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}

module.exports = mongoose.model('Admin', adminSchema)