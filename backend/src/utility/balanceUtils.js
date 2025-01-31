const { VirtualAccount } = require('../../models'); // Assuming your VirtualAccount model is here

/**
 * Check if the user has enough balance and deduct the specified amount.
 * @param {number} userId - The user's ID.
 * @param {number} amount - The amount to deduct.
 * @returns {Promise<number>} The new balance after deduction.
 * @throws Will throw an error if there are insufficient funds.
 */
const checkAndDeductBalance = async (userId, amount, transaction) => {
  const virtualAccount = await VirtualAccount.findOne({
    where: { user_id: userId },
    attributes: ['id', 'balance'], // Only fetch required fields
    transaction, // Use the transaction to ensure atomicity
  });

  if (!virtualAccount) {
    throw new Error('No virtual account found for this user');
  }

  const { id: virtualAccountId, balance } = virtualAccount;

  if (balance < amount) {
    throw new Error('Insufficient funds');
  }

  // Deduct balance
  const newBalance = balance - amount;
  await VirtualAccount.update(
    { balance: newBalance },
    { where: { id: virtualAccountId }, transaction }
  );

  return newBalance;
};

module.exports = { checkAndDeductBalance };
