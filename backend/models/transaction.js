const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    // Define associations
    static associate(db) {
      // A transaction belongs to a user
      Transaction.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

      // Optionally link debit and beneficiary virtual accounts
      Transaction.belongsTo(db.VirtualAccount, { foreignKey: 'debit_virtual_account_id', as: 'debitAccount' });
      Transaction.belongsTo(db.VirtualAccount, { foreignKey: 'beneficiary_virtual_account_id', as: 'beneficiaryAccount' });
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      transaction_type: {
        type: DataTypes.ENUM('transfer', 'airtime', 'data', 'bill'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0.01,
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      debit_virtual_account_id: {
        type: DataTypes.UUID,
        allowNull: false, // Must always have a debit account
        references: {
          model: 'VirtualAccounts',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true, // Additional details specific to transaction type
      },
      reversed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Initially, no transactions are reversed
      },
      reversal_reason: {
        type: DataTypes.STRING,
        allowNull: true, // Only set when a transaction is reversed
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
      modelName: 'Transaction',
      tableName: 'Transactions', // Explicitly set the table name
    }
  );

  return Transaction;
};
