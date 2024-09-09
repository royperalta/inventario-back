
import Reporte from '../models/Reportes.js';
import Producto from '../models/Producto.js';

// routes/reportes.js
import express from 'express';
//import { Reporte, Producto } from '../models/index.js';

const router = express.Router();

// Ruta para crear un reporte
router.post('/crear', async (req, res) => {
  const { producto_id, cantidad, precio_compra, precio_venta } = req.body;

  try {
    const producto = await Producto.findByPk(producto_id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const ganancia_esperada = (precio_venta - precio_compra) * cantidad;
    const venta_esperada = precio_venta * cantidad;

    const nuevoReporte = await Reporte.create({
      producto_id,
      cantidad,
      precio_compra,
      precio_venta,
      ganancia_esperada,
      venta_esperada
    });

    res.status(201).json(nuevoReporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
