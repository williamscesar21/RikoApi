//index.js

const express = require('express');
const router = express.Router();
const fs = require('fs'); // Esto es para interactuar con el sistema de archivos
const pathRouter = `${__dirname}`; // Es una variable en NodeJS que nos da el directorio donde estamos

const removeExtension = (fileName) => {
    return fileName.split('.').shift(); //Elimina y devuleve el primer elemento del array
}

fs.readdirSync(pathRouter).filter((file)=>{
    const fileNoExtension = removeExtension(file)
    const skip = ['index'].includes(fileNoExtension);// Esto crea un array con un solo elemento, en este caso, el nombre del archivo "index". Esa es la lista que debe omitir
    if(!skip){
        router.use(`/${fileNoExtension}`, require(`./${fileNoExtension}`))
    }
})

router.get('*',(req,res)=>{
    res.status(404)
    res.send({error: "Esto no funciona"})
})

module.exports = router
