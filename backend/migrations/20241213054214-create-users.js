'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bvn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastLogoutAt: {
        type: Sequelize.DATE,
        allowNull: true, // Initially null for new users
      },
      transaction_pin: {
        type: Sequelize.STRING,
        allowNull: false, // Ensuring transaction pin is never null
        defaultValue: '0000', // Default value for the transaction pin
      },
      is_transaction_pin_changed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Initially false to indicate the pin has not been changed
      },
      role: {
        type: Sequelize.ENUM('admin', 'agent', 'user'),
        allowNull: false,
        defaultValue: 'user', // Default role is 'user'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  },
};
