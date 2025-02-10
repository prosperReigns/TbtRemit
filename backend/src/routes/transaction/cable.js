const express = require('express');
const { subscribeToCable, getCableSubscriptionDetails } = require('../../services/cableSubscription');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction, Profit } = require('../../../models');
const getCablePlanDetails = require('../../utility/balanceUtils');
const router = express.Router();

// Middleware to authenticate user

/**
 * POST /cable-subscription
 * Endpoint to subscribe to a cable service
 */
router.post('/cable-subscription', authenticateUser, verifyTransactionPin, async (req, res) => {
  const { cablename, cableplan, smart_card_number, amount } = req.body;
  const transaction = await VirtualAccount.sequelize.transaction();
  
  try {
    // Validate input
    if (!cablename || !cableplan || !smart_card_number || !amount) {
      return res.status(400).json({ message: 'Cablename, cableplan, smart card number, and amount are required.' });
    }

    // Retrieve cable plan details
    const cablePlan = await getCablePlanDetails(cablename, cableplan);
    if (!cablePlan) {
      return res.status(404).json({ message: 'Invalid cable name or plan' });
    }

    const { cablePlan_id, cableName_id, amount: actualPrice, selling_price: sellingPrice } = cablePlan;
    const profit = sellingPrice - actualPrice;

    // Deduct only the actual plan price and update balance atomically
    await VirtualAccount.update(
      {
        balance: VirtualAccount.sequelize.literal(`balance - ${actualPrice}`),
        remit_profit: VirtualAccount.sequelize.literal(`remit_profit + ${profit}`),
        main_balance: VirtualAccount.sequelize.literal(`balance - ${profit}`),
      },
      { where: { user_id: req.user.id }, transaction }
    );

    // Atomically update profit balance
    await Profit.update(
      { balance: Profit.sequelize.literal(`balance + ${profit}`) },
      { where: { user_id: req.user.id }, transaction }
    );

    // Call the service to subscribe to the cable
    const result = await subscribeToCable(cablename_id, cableplan_id, smart_card_number);

    // Log transaction
    await logTransaction(
      {
        user_id: req.user.id,
        transaction_type: 'cable_subscription',
        amount: actualPrice,
        status: 'completed',
        debit_virtual_account_id: req.user.virtualAccountId,
        details: { cablename, cableplan, smart_card_number },
      },
      transaction
    );

    // Save the transaction details
    const newTransaction = await Transaction.create(
      {
        user_id: req.user.id,
        transaction_type: 'cable_subscription',
        amount: actualPrice,
        status: 'completed',
        debit_virtual_account_id: req.user.virtualAccountId,
        details: {
          cablename,
          cableplan,
          smart_card_number,
          subscriptionResponse: result,
        },
        reversed: false,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Cable subscription successful',
      mainBalance: await getUserMainBalance(req.user.id),
      data: result,
      transactionId: newTransaction.id,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error in cable subscription:', error);
    res.status(500).json({ message: 'Error subscribing to cable service', error: error.message });
  }
});

/**
 * GET /cable-subscription/:id
 * Endpoint to fetch details of a cable subscription by ID
 */
router.get('/cable-subscription/:id', authenticateUser, async (req, res) => {
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
