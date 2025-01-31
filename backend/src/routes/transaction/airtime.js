const express = require('express');
const { buyAirtime } = require('../../services/airtime');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction } = require('../../../models');

const router = express.Router();

router.use(authenticateUser);
router.use(verifyTransactionPin);

router.post('/buy-airtime', async (req, res) => {
  const { network, amount, phone, transaction_pin } = req.body;

  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Validate inputs
    if (!network || !amount || !phone) {
      return res.status(400).json({ message: 'Network, amount, and phone number are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const network_id = networkMapping[network.toUpperCase()];
    if (!network_id) {
      return res.status(400).json({ message: 'Invalid network name provided' });
    }

    // Check if balance is sufficient
    const balance = await VirtualAccount.findOne({ where: { user_id: req.user.id } });
    if (!balance || balance.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for airtime purchase' });
    }

    // Deduct balance and get the new balance (user's account)
    const newBalance = await checkAndDeductBalance(req.user.id, amount, transaction);

    // Perform airtime purchase
    const airtimeResponse = await buyAirtime(network_id, amount, phone);

    // Log the transaction with complete details
    await logTransaction({
      user_id: req.user.id,
      transaction_type: 'airtime',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        network_id,
        phone,
        airtimeResponse, // Store the full airtime response for later review
      },
    }, transaction);

    // Save the transaction details in the Transaction table
    const newTransaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'airtime',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        network_id,
        phone,
        airtimeResponse, // Store the full airtime response for later review
      },
      reversed: false,
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Airtime purchased successfully',
      newBalance,
      data: airtimeResponse,
      transactionId: newTransaction.id, // Optionally include the transaction ID in the response
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error buying airtime', error: err.message });
  }
});

// Route to get airtime purchase transaction
router.get('/get-airtime-transaction/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await getAllAirtimePurchase(id);
    return res.status(200).json({
      message: 'Airtime purchase transaction fetched successfully',
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error fetching airtime purchase transaction',
      error: error.message,
    });
  }
});

module.exports = router;
