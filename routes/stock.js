import express from 'express';
import  Producto  from '../models/Producto.js'; // Asegúrate de que la ruta al modelo es correcta
import { Op } from 'sequelize';
const router = express.Router();

// Ruta para obtener los productos ordenados por stock de menor a mayor
router.get('/', async (req, res) => {
  const { search } = req.query;

  try {
    // Si hay una búsqueda, filtra los productos por nombre
    let whereClause = {};
    if (search) {
      whereClause = {
        nombre: {
          [Op.like]: `%${search}%`
        }
      };
    }

    const productos = await Producto.findAll({
      where: whereClause,
      order: [['stock', 'ASC']] // Ordenar por stock de menor a mayor
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
