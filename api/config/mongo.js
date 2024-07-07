const mongoose = require('mongoose')

const dbConnect = ()=>{
    const DB_URI = process.env.DB_URI
    mongoose.connect(DB_URI)
    .then(()=>{
        console.log('MongoDB connected')
    })
    .catch(err=>{
        console.error("Error de conexion a la base de datos: ", err)
    })
}

module.exports = {
    dbConnect
} 