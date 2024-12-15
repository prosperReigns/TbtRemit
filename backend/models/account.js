const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class VirtualAccount extends Model {
        // define association
        static associate(db) {
            VirtualAccount.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
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
    },
    {
        sequelize,
        modelName: 'VirtualAccount',
      }
    );

  return VirtualAccount;
};