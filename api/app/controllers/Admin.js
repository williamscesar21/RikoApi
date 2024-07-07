// ../controllers/admin.js
const Admin = require('../models/Admin');

const registrarAdmin = async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({error: 'Todos los campos son obligatorios'});
    }   
    const admin = await Admin.create({username, password: await Admin.encryptPassword(password)});
    await admin.save();
    return res.status(201).json(admin);
}

// EL JSON PARA CREAR ADMIN ES DE LA SIGUIENTE FORMA:
// {
//     "username": "admin",
//     "password": "123456"
// }

const eliminarAdmin = async (req, res) => {
    const {id} = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    return res.status(200).json(admin);
}

module.exports = { registrarAdmin, eliminarAdmin }