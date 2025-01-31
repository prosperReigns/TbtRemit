const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    // define association
    static associate(db) {
      User.hasOne(db.VirtualAccount, { foreignKey: 'user_id', as: 'virtualAccount' });
    }

    // Method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Method to hash a new transaction pin
    async setTransactionPin(pin) {
      const salt = await bcrypt.genSalt(10);
      this.transaction_pin = await bcrypt.hash(pin, salt);
      this.is_transaction_pin_changed = true; // Mark that the user has changed their pin
    }

    async verifyTransactionPin(transaction_pin) {
      return bcrypt.compare(transaction_pin, this.transaction_pin);
    }
  }
  
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bvn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_pin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '0000',
      },
      role: {
        type: DataTypes.ENUM('admin', 'agent', 'user'),
        allowNull: false,
        defaultValue: 'user',
      },
      lastLogoutAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};