const express = require('express');
const { subscribeToCable, getCableSubscriptionDetails } = require('../../services/cableSubscription');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction } = require('../../../models');

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateUser);
router.use(verifyTransactionPin);

/**
 * POST /cable-subscription
 * Endpoint to subscribe to a cable service
 * Request Body: { cablename, cableplan, smart_card_number }
 */
router.post('/cable-subscription', async (req, res) => {
  const { cablename, cableplan, smart_card_number, amount, transaction_pin } = req.body;

  const transaction = await VirtualAccount.sequelize.transaction();
  
  try {
    // Validate input
    if (!cablename || !cableplan || !smart_card_number || !amount) {
      return res.status(400).json({ message: 'Cablename, cableplan, smart card number, and amount are required.' });
    }

    // Check if balance is sufficient
    const balance = await VirtualAccount.findOne({ where: { user_id: req.user.id } });
    if (!balance || balance.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance to subscribe to cable service' });
    }

    // Deduct balance and get the new balance
    const newBalance = await checkAndDeductBalance(req.user.id, amount, transaction);

    // Call the service to subscribe to the cable
    const result = await subscribeToCable(cablename, cableplan, smart_card_number);

    // Log the transaction
    await logTransaction({
      user_id: req.user.id,
      transaction_type: 'cable_subscription',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        cablename,
        cableplan,
        smart_card_number,
      },
    }, transaction);

    // Save the transaction details in the Transaction table
    const newTransaction = await Transaction.create({
      user_id: req.user.id,
      transaction_type: 'cable_subscription',
      amount,
      status: 'completed',
      debit_virtual_account_id: req.user.virtualAccountId,
      details: {
        cablename,
        cableplan,
        smart_card_number,
        subscriptionResponse: result,
      },
      reversed: false,
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Cable subscription successful',
      newBalance,
      data: result,
      transactionId: newTransaction.id, // Optionally include the transaction ID in the response
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in cable subscription:', error);
    res.status(500).json({
      message: 'Error subscribing to cable service',
      error: error.message,
    });
  }
});

/**
 * GET /cable-subscription/:id
 * Endpoint to fetch details of a cable subscription by ID
 */
router.get('/cable-subscription/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Call the service to fetch subscription details
    const details = await getCableSubscriptionDetails(id);
    res.status(200).json({
      message: 'Cable subscription details fetched successfully',
      data: details,
    });
  } catch (error) {
    console.error('Error fetching cable subscription details:', error);
    res.status(500).json({
      message: 'Error fetching cable subscription details',
      error: error.message,
    });
  }
});

module.exports = router;
