// models/TotalInvertido.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TotalInvertido = sequelize.define('TotalInvertido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    total_invertido: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'TotalInvertido'
});

export default TotalInvertido;
