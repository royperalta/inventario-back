// models/reporte.js
'use strict';
export default (sequelize, DataTypes) => {
    const Reporte = sequelize.define('Reporte', {
        producto_id: DataTypes.INTEGER,
        cantidad: DataTypes.INTEGER,
        precio_compra: DataTypes.DECIMAL(10, 2),
        precio_venta: DataTypes.DECIMAL(10, 2),
        ganancia_esperada: DataTypes.DECIMAL(10, 2),
        venta_esperada: DataTypes.DECIMAL(10, 2),
    }, {});
    Reporte.associate = function (models) {
        // associations can be defined here
        Reporte.belongsTo(models.Producto, { foreignKey: 'producto_id' });
    };
    return Reporte;
};
