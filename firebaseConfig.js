// firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./rikoweb-ff259-firebase-adminsdk-inz1w-4b7f9a62e0.json'); // Asegúrate de colocar el camino correcto a tu archivo de credenciales

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'rikoweb-ff259.appspot.com' // Reemplaza 'your-project-id' con el ID de tu proyecto de Firebase
});

const bucket = admin.storage().bucket();

module.exports = { bucket };
