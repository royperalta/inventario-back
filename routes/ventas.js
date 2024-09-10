import express from 'express';
import Venta from '../models/Venta.js';
import Producto from '../models/Producto.js';
import authMiddleware from '../middleware/auth.js'; // Ajusta la ruta según tu estructura de archivos

const router = express.Router();

// Ruta para registrar una venta (protegida)
router.post('/crear', authMiddleware, async (req, res) => {
    try {
        const { producto_id, cantidad, precio_venta } = req.body;

        // Verificar que el producto exista
        const producto = await Producto.findByPk(producto_id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Calcular el total de la venta
        const total = cantidad * precio_venta;

        // Crear la venta
        const venta = await Venta.create({
            producto_id,
            cantidad,
            precio_venta,
            total
        });

        // Reducir el stock del producto
        producto.stock -= cantidad;
        await producto.save();

        res.json(venta);
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ error: 'Error al registrar la venta' });
    }
});

// Ruta para obtener todas las ventas (protegida)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: {
                model: Producto,
                attributes: ['nombre']
            }
        });
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener las ventas:', error);
        res.status(500).json({ error: 'Error al obtener las ventas' });
    }
});

// Ruta para obtener el total de ventas hasta el momento (protegida)
router.get('/total-ventas', authMiddleware, async (req, res) => {
    try {
        // Sumar el total de todas las ventas
        const totalVentas = await Venta.sum('total');
        res.json({ totalVentas: totalVentas || 0 });
    } catch (error) {
        console.error('Error al obtener el total de ventas:', error);
        res.status(500).json({ error: 'Error al obtener el total de ventas' });
    }
});

// Ruta para obtener el total vendido, invertido y ganado por producto
router.get('/detalles/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el producto
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Obtener las ventas del producto
        const ventas = await Venta.findAll({
            where: { producto_id: id }
        });

        // Calcular totales
        const cantidadVendida = ventas.reduce((sum, venta) => sum + venta.cantidad, 0);
        const totalInvertido = cantidadVendida * producto.precio_compra;
        const totalGanado = cantidadVendida * (producto.precio_venta - producto.precio_compra);

        res.json({
            producto: producto.nombre,
            cantidadVendida,
            totalInvertido: totalInvertido.toFixed(2),
            totalGanado: totalGanado.toFixed(2)
        });
    } catch (error) {
        console.error('Error al obtener detalles de las ventas:', error);
        res.status(500).json({ error: 'Error al obtener detalles de las ventas' });
    }
});

export default router;
