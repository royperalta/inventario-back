import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import productosRouter from './routes/productos.js';
import ventasRouter from './routes/ventas.js';
import reportesRouter from './routes/reportes.js';
import stockRoutes from './routes/stock.js'; // Asegúrate de que la ruta es correcta
import authRouter from './routes/auth.js';
const app = express();
app.use(express.json());

// Configura CORS
app.use(cors());

// Rutas
app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/stock', stockRoutes);
app.use('/api/auth', authRouter);

// Sincroniza la base de datos
sequelize.sync()
    .then(() => console.log('Base de datos sincronizada'))
    .catch((error) => console.log('Error al sincronizar la base de datos', error));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
