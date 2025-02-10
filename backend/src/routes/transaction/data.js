const express = require('express');
const { buyData } = require('../../services/buyData');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction, Profit, DataPlan } = require('../../../models');
const { networkMapping } = require('../../utility/mappingUtil');

const router = express.Router();


router.post('/buy-data', authenticateUser, verifyTransactionPin, async (req, res) => {
  const { network, phoneNumber, amount, size, validity, transaction_pin } = req.body;

  if (!network || !phoneNumber || !amount || !size || !validity) {
      return res.status(400).json({ message: 'Network, phone number, amount, size, and validity are required' });
  }

  // Fetch the matching data plan
  const dataPlan = await DataPlan.findOne({
      where: { network, amount, size, validity }
  });

  if (!dataPlan) {
      return res.status(400).json({ message: 'No matching data plan found' });
  }

  const plan_id = dataPlan.data_id;
  const actualPrice = dataPlan.amount;
  const sellingPrice = dataPlan.sellling_price;
  const profit = sellingPrice - actualPrice;

  const network_id = networkMapping[network.toUpperCase()];

  // Start a transaction
  const transaction = await VirtualAccount.sequelize.transaction();
  try {
      // Lock user account for update to prevent race conditions
      const userAccount = await VirtualAccount.findOne({
          where: { user_id: req.user.id },
          lock: transaction.LOCK.UPDATE,
          transaction
      });

      if (!userAccount) {
          throw new Error('User account not found');
      }

      // Check for sufficient balance
      if (parseFloat(userAccount.balance) < actualPrice) {
          throw new Error('Insufficient balance for data purchase');
      }

      // Make API call to buy data
      const dataResponse = await buyData(network_id, plan_id, phoneNumber);
      if (!dataResponse || dataResponse.status !== 'success') {
          throw new Error('Data purchase failed');
      }

      // Deduct balance and update remit_profit atomically
      const newBalance = parseFloat(userAccount.balance) - actualPrice;
      const newMainBalance = newBalance;

      await userAccount.update(
          {
              balance: newBalance.toFixed(2),
              main_balance: newMainBalance.toFixed(2),
              remit_profit: VirtualAccount.sequelize.literal(`remit_profit + ${profit}`)
          },
          { transaction }
      );

      // Ensure profit record exists and update balance
      const [profitRecord, created] = await Profit.findOrCreate({
          where: { user_id: req.user.id },
          defaults: { balance: profit },
          transaction
      });

      if (!created) {
          await profitRecord.increment('balance', { by: profit, transaction });
      }

      // Log the transaction
      const newTransaction = await Transaction.create({
          user_id: req.user.id,
          transaction_type: 'data',
          amount: actualPrice,
          status: 'completed',
          debit_virtual_account_id: userAccount.id,
          details: { network, plan_id, dataResponse },
          reversed: false
      }, { transaction });

      // Commit the transaction
      await transaction.commit();

      res.status(200).json({
          message: 'Data purchased successfully',
          newBalance: newBalance.toFixed(2),
          main_balance: newMainBalance.toFixed(2),
          transactionId: newTransaction.id,
          data: dataResponse
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
