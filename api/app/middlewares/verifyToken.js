const jwt = require('jsonwebtoken');
const Client = require('../models/Client');


const verifyToken = async (req,res,next)=>{
    const token = req.headers['authorization'];

    if(!token){
        return res.status(403).json({message: "Token no enviado"})
    }

    try{
        const decoded = jwt.verify(token, process.env.DB_KEY)
        req.clientId = decoded.id
        const client = await Client.findById(req.clientId)
        if(!client){
            return res.status(404).json({message: "Usuario no encontrado"})
        }
        next()

    }catch(error){
        return res.status(401).json({message: "Error"})
    }
}

module.exports = { verifyToken }
