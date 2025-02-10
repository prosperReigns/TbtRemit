const cron = require('node-cron');
const { Profit, VirtualAccount } = require('../models');
const processProfitPayout = require('./processProfitPayout');

const scheduleMonthlyPayouts = () => {
  // Runs at 11:59 PM on the last day of the month
  cron.schedule('59 23 L * *', async () => {
    console.log('Running end-of-month profit payout...');

    try {
      // Get all users with profit balance > 100
      const usersWithProfit = await Profit.findAll({ where: { balance: { $gt: 100 } } });

      if (usersWithProfit.length === 0) {
        console.log('No users eligible for payout.');
        return;
      }

      for (const profit of usersWithProfit) {
        const userId = profit.user_id;
        const sessionId = `session_${Date.now()}`; // Generate a session ID

        console.log(`Processing payout for user: ${userId}`);
        const result = await processProfitPayout(userId, sessionId);
        console.log(result);
      }

      console.log('Monthly profit payout task completed.');
    } catch (error) {
      console.error('Error running monthly profit payout:', error);
    }
  });
};

module.exports = scheduleMonthlyPayouts;
