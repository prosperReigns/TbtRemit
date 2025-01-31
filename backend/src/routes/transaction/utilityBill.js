const express = require('express');
const { payElectricityBill } = require('../../services/utilityBill'); // Adjust the path if necessary
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction } = require('../../../models');

const router = express.Router();

// Middleware to authenticate the user
router.use(authenticateUser);
router.use(verifyTransactionPin);

// Route to pay electricity bills
router.post('/pay-bills', async (req, res) => {
  const { disco_name, amount, meter_number, meter_type, transaction_pin } = req.body;

  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Validate inputs
    if (!disco_name || !amount || !meter_number || !meter_type) {
      return res.status(400).json({ message: 'Disco name, amount, meter number, and meter type are required' });
    }

    // Ensure meter type is either PREPAID (1) or POSTPAID (2)
    if (![1, 2].includes(meter_type)) {
      return res.status(400).json({ message: 'Meter type must be 1 (PREPAID) or 2 (POSTPAID)' });
    }

    // Check if balance is sufficient
    const balance = await VirtualAccount.findOne({ where: { user_id: req.user.id } });
    if (!balance || balance.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance to pay the bill' });
    }

    // Deduct balance and get the new balance (user's account)
    const newBalance = await checkAndDeductBalance(req.user.id, amount, transaction);

    // Call the payElectricityBill service
    const billPaymentResponse = await payElectricityBill(disco_name, amount, meter_number, meter_type);

    // Log the transaction
    await logTransaction({
      user_id: req.user.id,
      transaction_type: 'bill_payment',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        disco_name,
        meter_number,
        meter_type,
      },
    }, transaction);

    // Save the transaction details in the Transaction table
    const newTransaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'bill_payment',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        disco_name,
        meter_number,
        meter_type,
        billPaymentResponse,
      },
      reversed: false,
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Bill payment successful',
      newBalance,
      data: billPaymentResponse,
      transactionId: newTransaction.id, // Optionally include the transaction ID in the response
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      message: 'Error paying bill',
      error: error.message,
    });
  }
});

module.exports = router;
