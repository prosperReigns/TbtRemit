const express = require('express');
const { buyData } = require('../../services/buyData');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction } = require('../../../models');

const router = express.Router();

router.use(authenticateUser);
router.use(verifyTransactionPin);

router.post('/buy-data', async (req, res) => {
  const { network, plan_id, amount, transaction_pin } = req.body;

  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Validate inputs
    if (!network || !plan_id || !amount) {
      return res.status(400).json({ message: 'Network, plan ID, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    // Convert network name to network ID
    const network_id = networkMapping[network.toUpperCase()];
    if (!network_id) {
      return res.status(400).json({ message: 'Invalid network name provided' });
    }

    // Check if balance is sufficient
    const balance = await VirtualAccount.findOne({ where: { user_id: req.user.id } });
    if (!balance || balance.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for data purchase' });
    }

    // Deduct balance and get the new balance (user's account)
    const newBalance = await checkAndDeductBalance(req.user.id, amount, transaction);

    // Perform data purchase
    const dataResponse = await buyData(network_id, plan_id);

    // Log the transaction with complete details
    await logTransaction({
      user_id: req.user.id,
      transaction_type: 'data',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        network_id,
        plan_id,
        dataResponse, // Store the full response for later review
      },
    }, transaction);

    // Save the transaction details in the Transaction table
    const newTransaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'data',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        network_id,
        plan_id,
        dataResponse, // Store the full response for later review
      },
      reversed: false,
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data purchased successfully',
      newBalance,
      data: dataResponse,
      transactionId: newTransaction.id, // Optionally include the transaction ID in the response
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error buying data', error: err.message });
  }
});

// Route to get all data purchases
router.get('/get-all-data-purchase', async (req, res) => {
  try {
    const response = await getAllDataPurchase();
    return res.status(200).json({
      message: 'All data purchases fetched successfully',
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error fetching data purchases',
      error: error.message,
    });
  }
});

// Route to get a single data purchase by ID
router.get('/get-data-purchase/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await getOneDataPurchase(id);
    return res.status(200).json({
      message: 'Data purchase fetched successfully',
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error fetching data purchase',
      error: error.message,
    });
  }
});

module.exports = router;
