// ../middlewares/multerMiddleware.js
const multer = require('multer');

// Middleware de Multer
const storage = multer.memoryStorage(); // Almacenamiento en memoria

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limita el tamaño del archivo a 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
}).fields([{ name: 'logo', maxCount: 1 }, { name: 'foto_establecimiento', maxCount: 1 }]);

module.exports = upload;
