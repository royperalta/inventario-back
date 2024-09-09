import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';



const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    precio_compra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    precio_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'Productos',
    hooks: {
        beforeSave: (producto) => {
            if (producto.precio_compra < 0 || producto.precio_venta < 0) {
                throw new Error('Los precios deben ser positivos.');
            }
        }
    }
});



Producto.prototype.calcularGanancia = function() {
    return (this.precio_venta - this.precio_compra) * this.stock;
};


export default Producto;
