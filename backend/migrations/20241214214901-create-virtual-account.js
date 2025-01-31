'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VirtualAccounts', {
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
          model: 'Users',
          key: 'id',
        },
      },
      account_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      account_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bvn: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nominal_annual_interest_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      lockin_period_frequency: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      allow_overdraft: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      charge_with_holding_tax: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      charge_value_added_tax: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      charge_stamp_duty: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      cba_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_id: {  // New field to store the _id from the response
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VirtualAccounts');
  },
};
