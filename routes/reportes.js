import express from 'express';
import Venta from '../models/Venta.js';
import Producto from '../models/Producto.js'; // Importar si necesitas usarlo

const router = express.Router();

router.get('/total-vendido', async (req, res) => {
  try {
      const totalVendido = await Venta.sum('total');
      res.json({ totalVendido: totalVendido || 0 });
  } catch (error) {
      console.error('Error al obtener el total vendido:', error);
      res.status(500).json({ error: 'Error al obtener el total vendido' });
  }
});


router.get('/total-invertido', async (req, res) => {
  try {
      const ventas = await Venta.findAll({
          include: {
              model: Producto,
              attributes: ['precio_compra']
          }
      });

      const totalInvertido = ventas.reduce((total, venta) => {
          return total + (venta.cantidad * venta.Producto.precio_compra);
      }, 0);

      res.json({ totalInvertido: totalInvertido.toFixed(2) });
  } catch (error) {
      console.error('Error al obtener el total invertido:', error);
      res.status(500).json({ error: 'Error al obtener el total invertido' });
  }
});


router.get('/total-ganado', async (req, res) => {
  try {
      const [totalVendido, totalInvertido] = await Promise.all([
          Venta.sum('total'),
          Venta.findAll({
              include: {
                  model: Producto,
                  attributes: ['precio_compra']
              }
          }).then(ventas => ventas.reduce((total, venta) => {
              return total + (venta.cantidad * venta.Producto.precio_compra);
          }, 0))
      ]);

      const totalGanado = (totalVendido || 0) - (totalInvertido || 0);

      res.json({ totalGanado: totalGanado.toFixed(2) });
  } catch (error) {
      console.error('Error al obtener el total ganado:', error);
      res.status(500).json({ error: 'Error al obtener el total ganado' });
  }
});


// Ruta para obtener cantidad vendida, invertida y ganada por producto
router.get('/detalles-producto', async (req, res) => {
  try {
      const productos = await Producto.findAll();
      const detalles = await Promise.all(productos.map(async producto => {
          const ventas = await Venta.findAll({
              where: { producto_id: producto.id }
          });

          const cantidadVendida = ventas.reduce((total, venta) => total + venta.cantidad, 0);
          const totalInvertido = ventas.reduce((total, venta) => total + (venta.cantidad * producto.precio_compra), 0);
          const totalVendido = ventas.reduce((total, venta) => total + venta.total, 0);
          const totalGanado = totalVendido - totalInvertido;

          return {
              producto: producto.nombre,
              cantidadVendida,
              totalInvertido: totalInvertido.toFixed(2),
              totalVendido: totalVendido.toFixed(2),
              totalGanado: totalGanado.toFixed(2)
          };
      }));

      res.json(detalles);
  } catch (error) {
      console.error('Error al obtener detalles por producto:', error);
      res.status(500).json({ error: 'Error al obtener detalles por producto' });
  }
});


export default router;
