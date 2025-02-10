const { Profit, VirtualAccount } = require('../../models');
const transferFunds = require('../services/transferservices');

const ADMIN_ACCOUNT_NUMBER = process.env.ADMIN_ACCOUNT; // Store admin account number in environment variables

const processProfitPayout = async (userId, sessionId) => {
  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Get the user's profit balance
    const profitRecord = await Profit.findOne({ where: { user_id: userId }, transaction });

    if (!profitRecord || parseFloat(profitRecord.balance) <= 100) {
      throw new Error(`User ${userId} does not have enough profit balance for payout.`);
    }

    const amountToTransfer = parseFloat(profitRecord.balance);
    
    // Get user's main account
    const userAccount = await VirtualAccount.findOne({ where: { user_id: userId }, transaction });

    if (!userAccount) {
      throw new Error(`User ${userId} does not have a virtual account.`);
    }

    // Initiate fund transfer to admin account
    const transferResponse = await transferFunds({
      nameEnquiryReference: sessionId,
      debitAccountNumber: userAccount.account_number,
      beneficiaryBankCode: '000', // Assuming the same bank
      beneficiaryAccountNumber: ADMIN_ACCOUNT_NUMBER,
      amount: amountToTransfer,
      narration: 'Monthly profit payout',
      saveBeneficiary: false,
    });

    // Ensure the transfer was successful
    if (transferResponse.data.status !== 'Completed') {
      throw new Error('Profit payout transfer failed');
    }

    // Reset profit balance & remit_profit balance
    await profitRecord.update({ balance: 0 }, { transaction });
    await userAccount.update(
      {
        remit_profit: 0,
        main_balance: userAccount.balance, // Ensure main_balance matches actual balance
      },
      { transaction }
    );

    await transaction.commit();
    return { success: true, message: `Profit payout of N${amountToTransfer} completed for user ${userId}` };
  } catch (error) {
    await transaction.rollback();
    console.error(`Error processing profit payout for user ${userId}:`, error);
    return { success: false, message: error.message };
  }
};

module.exports = processProfitPayout;
