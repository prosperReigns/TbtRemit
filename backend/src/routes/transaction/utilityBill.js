const express = require('express');
const { payElectricityBill } = require('../../services/utilityBill'); // Adjust the path if necessary
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction, Profit } = require('../../../models');

const router = express.Router();

// Middleware to authenticate the user

// Route to pay electricity bills
router.post('/pay-bills', authenticateUser, verifyTransactionPin, async (req, res) => {
  const { disco_name, amount, meter_number, meter_type } = req.body;

  if (!disco_name || !amount || !meter_number || !meter_type) {
    return res.status(400).json({ message: 'Disco name, amount, meter number, and meter type are required' });
  }

  if (![1, 2].includes(meter_type)) {
    return res.status(400).json({ message: 'Meter type must be 1 (PREPAID) or 2 (POSTPAID)' });
  }

  const profit = 10; // ₦10 profit on all transactions
  const actualPrice = amount;

  try {
    // Fetch the user's balance first (OUTSIDE transaction)
    const virtualAccount = await VirtualAccount.findOne({
      where: { user_id: req.user.id },
    });

    if (!virtualAccount || virtualAccount.balance < actualPrice) {
      return res.status(400).json({ message: 'Insufficient balance to pay the bill' });
    }

    // Start transaction
    const transaction = await VirtualAccount.sequelize.transaction();

    try {
      // Atomic balance deduction
      const [updatedAccount] = await VirtualAccount.update(
        {
          balance: virtualAccount.balance - actualPrice,
          remit_profit: virtualAccount.remit_profit + profit,
          main_balance: virtualAccount.balance - actualPrice - profit,
        },
        {
          where: { user_id: req.user.id, balance: virtualAccount.balance },
          returning: true,
          transaction,
        }
      );

      if (!updatedAccount) {
        throw new Error('Balance update failed due to concurrent modification.');
      }

      // Update the profit table atomically
      await Profit.increment(
        { balance: profit },
        { where: { user_id: req.user.id }, transaction }
      );

      // Call the electricity bill payment service
      const billPaymentResponse = await payElectricityBill(disco_name, amount, meter_number, meter_type);

      // Log the transaction
      await logTransaction(
        {
          user_id: req.user.id,
          transaction_type: 'bill_payment',
          amount: actualPrice,
          status: 'completed',
          debit_virtual_account_id: req.user.virtualAccountId,
          details: {
            disco_name,
            meter_number,
            meter_type,
          },
        },
        transaction
      );

      // Save the transaction in the database
      const newTransaction = await Transaction.create(
        {
          user_id: req.user.id,
          transaction_type: 'bill_payment',
          amount: actualPrice,
          status: 'completed',
          debit_virtual_account_id: req.user.virtualAccountId,
          details: {
            disco_name,
            meter_number,
            meter_type,
            billPaymentResponse,
          },
          reversed: false,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      res.status(200).json({
        message: 'Bill payment successful',
        newBalance: updatedAccount.balance,
        main_balance: updatedAccount.main_balance,
        data: billPaymentResponse,
        transactionId: newTransaction.id,
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error paying bill',
      error: error.message,
    });
  }
});

module.exports = router;
