const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class VirtualAccount extends Model {
        // define association
        static associate(db) {
            VirtualAccount.belongsTo(db.User, { foreignKey: 'user_id', as: 'user', targetKey: 'id' });
        }

        static async generateAccountNumber() {
            const timestamp = Date.now().toString().slice(-6);
            const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
            return `${timestamp}${randomDigits}`;
        }
    }

    VirtualAccount.init(
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
        account_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        account_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        account_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        currency_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bvn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        nominal_annual_interest_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        lockin_period_frequency: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        allow_overdraft: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        charge_with_holding_tax: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        charge_value_added_tax: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        charge_stamp_duty: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        cba_account_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        account_id: {  // New field to store the _id from the response
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'VirtualAccount',
    });

    return VirtualAccount;
};
