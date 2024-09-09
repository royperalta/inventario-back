import express from 'express';
import Producto from '../models/Producto.js';

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
        const productosConGanancia = productos.map(producto => ({
            ...producto.toJSON(),
            ganancia: producto.calcularGanancia()
        }));

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

        productos.forEach(producto => {
            gananciasTotales += producto.calcularGanancia();
        });

        res.json({ gananciasEsperadas: gananciasTotales.toFixed(2) });
    } catch (error) {
        console.error('Error al obtener las ganancias esperadas:', error);
        res.status(500).json({ error: 'Error al obtener las ganancias esperadas' });
    }
});

export default router;


