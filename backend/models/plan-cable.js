const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class CablePlan extends Model {}

    CablePlan.init(
        {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        cablePlan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cableName_id: {
            type: DataTypes.INTEGER,
            allowNull: false,

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
            }
        },
            selling_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0,
                }
            },
    }, {
        sequelize,
        tableName: 'cablePlan',
        timestamps: true,
    });

    return CablePlan;
};
