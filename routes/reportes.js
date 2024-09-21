import express from 'express';
import Venta from '../models/Venta.js';
import Producto from '../models/Producto.js'; // Importar si necesitas usarlo
import { Op } from 'sequelize';


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

router.get('/ventas-por-dia', async (req, res) => {
    try {
        const { fecha } = req.query;

        let inicioDia, finDia;

        // Configura la zona horaria de Perú (UTC-5)
        const zonaHorariaPeru = -5 * 60 * 60 * 1000; // -5 horas en milisegundos

        if (fecha) {
            // Si se pasa una fecha en el query param, convertirla a formato Date
            const fechaSeleccionada = new Date(fecha);
            if (isNaN(fechaSeleccionada)) {
                return res.status(400).json({ error: 'Fecha inválida' });
            }

            inicioDia = new Date(fechaSeleccionada);
            inicioDia.setUTCHours(0, 0, 0, 0); // Inicio del día a las 00:00 UTC
            inicioDia = new Date(inicioDia.getTime() + zonaHorariaPeru); // Ajustar a Perú

            finDia = new Date(fechaSeleccionada);
            finDia.setUTCHours(23, 59, 59, 999); // Fin del día a las 23:59:59 UTC
            finDia = new Date(finDia.getTime() + zonaHorariaPeru); // Ajustar a Perú
        } else {
            // Si no se pasa una fecha, usar el día actual
            const hoy = new Date();
            inicioDia = new Date(hoy);
            inicioDia.setUTCHours(0, 0, 0, 0); // Inicio del día a las 00:00 UTC
            inicioDia = new Date(inicioDia.getTime() + zonaHorariaPeru); // Ajustar a Perú

            finDia = new Date(hoy);
            finDia.setUTCHours(23, 59, 59, 999); // Fin del día a las 23:59:59 UTC
            finDia = new Date(finDia.getTime() + zonaHorariaPeru); // Ajustar a Perú
        }

        // Buscar todas las ventas en el rango de fechas
        const ventas = await Venta.findAll({
            where: {
                createdAt: {
                    [Op.between]: [inicioDia, finDia], // Ventas entre el inicio y fin del día
                },
            },
            include: {
                model: Producto,
                attributes: ['nombre', 'precio_compra'], // Puedes añadir más campos si lo deseas
            },
        });

        // Sumar el total vendido en el día consultado
        const totalVendidoDia = ventas.reduce((total, venta) => total + venta.total, 0);

        res.json({
            ventas,
            totalVendidoDia: totalVendidoDia.toFixed(2), // Formato a 2 decimales
        });
    } catch (error) {
        console.error('Error al obtener las ventas por día:', error);
        res.status(500).json({ error: 'Error al obtener las ventas por día' });
    }
});


export default router;
