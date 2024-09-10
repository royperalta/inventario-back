import express from 'express';
import Producto from '../models/Producto.js';
import Venta from '../models/Venta.js'
const router = express.Router();

// Ruta para crear o actualizar un producto
router.post('/crear', async (req, res) => {
    try {
        const { nombre, stock, precio_compra, precio_venta } = req.body;

        // Validar los datos recibidos
        if (precio_compra < 0 || precio_venta < 0) {
            return res.status(400).json({ error: 'Los precios deben ser positivos.' });
        }

        let producto = await Producto.findOne({ where: { nombre } });

        if (producto) {
            // Si el producto existe, actualiza el stock y los precios
            producto.stock += stock;
            producto.precio_compra = precio_compra;
            producto.precio_venta = precio_venta;
            await producto.save();
        } else {
            // Si no existe, crea un nuevo producto
            producto = await Producto.create({ nombre, stock, precio_compra, precio_venta });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error en la ruta /crear:', error);
        res.status(500).json({ error: 'Error al crear o actualizar el producto' });
    }
});

// Ruta para obtener todos los productos con su ganancia calculada
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll();

        // Incluir la ganancia calculada en cada producto
        const productosConGanancia = productos.map(producto => {
            const ganancia = (producto.precio_venta - producto.precio_compra) * producto.stock;
            return {
                ...producto.toJSON(),
                ganancia
            };
        });

        res.json(productosConGanancia);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para actualizar un producto por su ID
router.put('/actualizar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, stock, precio_compra, precio_venta } = req.body;

        // Validar los datos recibidos
        if (precio_compra < 0 || precio_venta < 0) {
            return res.status(400).json({ error: 'Los precios deben ser positivos.' });
        }

        // Encuentra el producto por ID
        const producto = await Producto.findByPk(id);

        if (producto) {
            // Actualiza el producto
            if (nombre !== undefined) producto.nombre = nombre;
            if (stock !== undefined) producto.stock = stock;
            if (precio_compra !== undefined) producto.precio_compra = precio_compra;
            if (precio_venta !== undefined) producto.precio_venta = precio_venta;

            await producto.save();
            res.json(producto);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error en la ruta /actualizar/:id:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Ruta para obtener el reporte de ganancias esperadas
router.get('/ganancias-esperadas', async (req, res) => {
    try {
        const productos = await Producto.findAll();

        let gananciasTotales = 0;

        for (const producto of productos) {
            // Obtener el historial de ventas del producto
            const ventas = await Venta.findAll({
                where: { producto_id: producto.id }
            });

            let totalVendido = 0;
            let totalInvertido = 0;
            let totalGanado = 0;

            ventas.forEach(venta => {
                totalVendido += venta.total;
                totalInvertido += producto.precio_compra * venta.cantidad;
            });

            totalGanado = totalVendido - totalInvertido;

            gananciasTotales += totalGanado;
        }

        res.json({ gananciasEsperadas: gananciasTotales.toFixed(2) });
    } catch (error) {
        console.error('Error al obtener las ganancias esperadas:', error);
        res.status(500).json({ error: 'Error al obtener las ganancias esperadas' });
    }
});


// Ruta para obtener la cantidad vendida, invertida y ganada por producto
router.get('/detalles/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const ventas = await Venta.findAll({
            where: { producto_id: id }
        });

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
        console.error('Error al obtener detalles del producto:', error);
        res.status(500).json({ error: 'Error al obtener detalles del producto' });
    }
});

export default router;
