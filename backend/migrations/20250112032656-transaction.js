'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // Assumes a 'Users' table exists
          key: 'id',
        },
        onDelete: 'CASCADE', // Deletes transactions if the user is deleted
        onUpdate: 'CASCADE',
      },
      transaction_type: {
        type: Sequelize.ENUM('transfer', 'airtime', 'data', 'bill'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0.01,
        },
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      debit_virtual_account_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'VirtualAccounts', // Assumes a 'VirtualAccounts' table exists
          key: 'id',
        },
        onDelete: 'SET NULL', // If the account is deleted, keep transaction data
        onUpdate: 'CASCADE',
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true, // Stores additional metadata about the transaction
      },
      reversed : {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reversal_reason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  },
};
