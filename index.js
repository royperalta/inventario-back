/* import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import productosRouter from './routes/productos.js';
import ventasRouter from './routes/ventas.js';
import reportesRouter from './routes/reportes.js';
import stockRoutes from './routes/stock.js'; // Asegúrate de que la ruta es correcta
import authRouter from './routes/auth.js';
import Producto from './models/Producto.js';
import Venta from './models/Venta.js';

// Establecer las relaciones
Producto.hasMany(Venta, { foreignKey: 'producto_id' });
Venta.belongsTo(Producto, { foreignKey: 'producto_id' });

// Sincronizar la base de datos
sequelize.sync()
    .then(() => console.log('Base de datos sincronizada'))
    .catch((error) => console.log('Error al sincronizar la base de datos', error));

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
 */



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';

import sequelize from './config/database.js';
import productosRouter from './routes/productos.js';
import ventasRouter from './routes/ventas.js';
import reportesRouter from './routes/reportes.js';
import stockRoutes from './routes/stock.js';
import authRouter from './routes/auth.js';
import Producto from './models/Producto.js';
import Venta from './models/Venta.js';

// Configura dotenv
dotenv.config();

// Establecer las relaciones
Producto.hasMany(Venta, { foreignKey: 'producto_id' });
Venta.belongsTo(Producto, { foreignKey: 'producto_id' });

// Sincronizar la base de datos
sequelize.sync()
    .then(() => console.log('Base de datos sincronizada'))
    .catch((error) => console.log('Error al sincronizar la base de datos', error));

const app = express();



// Middleware para analizar cuerpos JSON
app.use(express.json());

// Configura CORS
const allowedOrigins = ['http://localhost:3000', 'https://envivo.top:9300', 'https://envivo.top'];

app.use(cors({
  origin: function(origin, callback) {
    // Permite solicitudes desde cualquier dominio si no se proporciona el encabezado 'Origin'
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El acceso desde el origen no está permitido';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true // Permite enviar cookies en la solicitud
}));

// Rutas
app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/stock', stockRoutes);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 9000;

if (process.env.NODE_ENV === 'production') {  
    // Configuración HTTPS en producción
    const httpsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/envivo.top/privkey.pem'), // Ruta a tu clave privada
        cert: fs.readFileSync('/etc/letsencrypt/live/envivo.top/fullchain.pem'), // Ruta a tu certificado
    };

    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(PORT, () => {
        console.log('Servidor HTTPS corriendo en el puerto ' + PORT);
    });
} else {
    // Configuración HTTP en desarrollo
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
        console.log('Servidor HTTP corriendo en el puerto ' + PORT);
    });
}
