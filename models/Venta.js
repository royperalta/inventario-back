import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Productos', // Nombre de la tabla en la base de datos
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio_venta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'Ventas'
});

// Asignar la relación en otro archivo para evitar problemas de importación circular
Venta.associate = models => {
    Venta.belongsTo(models.Producto, { foreignKey: 'producto_id' });
};

export default Venta;
