import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const users = [
    { id: 1, username: 'admin', password: bcrypt.hashSync(process.env.PASSWORD, 10) },
];

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

// Ruta para logout
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Elimina el token de las cookies
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

export default router;
