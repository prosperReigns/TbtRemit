const { Transaction } = require('../../models'); // Assuming your Transaction model is here

/**
 * Log a transaction in the Transaction table.
 * @param {Object} data - The transaction data.
 * @param {Sequelize.Transaction} transaction - The Sequelize transaction instance.
 */
const logTransaction = async (data, transaction) => {
  await Transaction.create(data, { transaction });
};

module.exports = { logTransaction };
