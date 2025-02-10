const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Profit extends Model {}

    Profit.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            balance: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
            },
        },
        {
            sequelize,
            modelName: 'Profit',
        });
        return Profit;
};