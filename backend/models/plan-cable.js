const { DataTypes } = require('sequelize');

const CablePlan = sequelize.define('cablePlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    cablePlan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: 'cablePlan',
    timestamps: true,
});

module.exports = CablePlan;
