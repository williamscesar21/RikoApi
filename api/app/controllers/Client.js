// ../controllers/Client.js

const Client = require('../models/Client');
const Wallet = require('../models/Wallet');
const Cart = require('../models/Cart');

const registrarClient = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, location } = req.body;
        if (!nombre || !apellido || !email || !password || !telefono || !location) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        const client = await Client.create({ nombre, apellido, email, password: await Client.encryptPassword(password), telefono, location });
        await client.save();
        const wallet = new Wallet({ user: client._id, userType: 'Client' });
        await wallet.save();
        const cart = new Cart({ user: client._id });
        await cart.save();
        return res.status(201).json(client);
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// EL JSON PARA CREAR CLIENTE ES DE LA SIGUIENTE FORMA:
// {
//     "nombre": "Williams",
//     "apellido": "Briceño",
//     "email": "williamscesar21@gmail.com",
//     "password": "Williams21.",
//     "telefono": "04121510662",
//     "location": "9.5377, -69.1867"
// }

const obtenerClients = async (req, res) => {
    try {
        const clients = await Client.find();
        return res.status(200).json(clients);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const obtenerClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id);
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarPropiedadClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { propiedad, valor } = req.body;
        const client = await Client.findByIdAndUpdate(id, { [propiedad]: valor }, { new: true });
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarEstatusClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { estatus } = req.body;
        const client = await Client.findByIdAndUpdate(id, { estatus }, { new: true });
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const actualizarLocationClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;

        // Validar que la ubicación cumpla con el formato esperado
        const location = `${lat},${lng}`;
        if (!/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(location)) {
            return res.status(400).json({ error: 'Ubicación inválida' });
        }

        // Buscar el cliente y verificar su estatus
        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar si el cliente está en línea
        if (client.estatus !== 'Activo') {
            return res.status(403).json({ error: 'El cliente no tiene estatus en línea' });
        }

        // Actualizar la ubicación del cliente
        client.location = location;
        await client.save();

        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


const suspenderClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndUpdate(id, { suspendido: true }, { new: true });
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const eliminarClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndDelete(id);
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const cliente = await Client.findById(id);

    if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const hashedPassword = await Client.encryptPassword(password);
    cliente.password = hashedPassword;
    await cliente.save();
    res.json(cliente);
};

module.exports = {
    registrarClient,
    obtenerClients,
    obtenerClient,
    actualizarPropiedadClient,
    actualizarEstatusClient,
    actualizarLocationClient,
    suspenderClient,
    eliminarClient,
    updatePassword
}