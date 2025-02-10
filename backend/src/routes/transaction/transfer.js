const express = require('express');
const transferFunds = require('../../services/transferservices');
const getBankList = require('../../services/bankList');
const nameEnquiryReference = require('../../services/nameEnquiry');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction, Profit } = require('../../../models');

const router = express.Router();

router.post('/bank-list', authenticateUser, async (req, res) => {
  const { bank_name } = req.body;
  const banks = await getBankList();
  

  if (!banks || !Array.isArray(banks.data)) {
    return res.status(500).json({ error: "Invalid data format for banks" });
  }

  const exactMatch = banks.data.find(
    (bank) => bank.name && bank.name.toLowerCase() === bank_name.toLowerCase()
  );

  if (exactMatch) {
    return res.status(200).json({
      bankName: exactMatch.name,
      bankCode: exactMatch.bankCode,
    });
  }

  // Partial match: Find all banks with partially matching names
  const partialMatches = banks.data.filter(
    (bank) =>
      bank.name && bank.name.toLowerCase().includes(bank_name.toLowerCase())
  );

  if (partialMatches.length > 0) {
    return res.status(200).json(partialMatches);
  }

  return res.status(404).json({ error: "No banks found with that name" });
});

router.post('/name-enquiry', authenticateUser, async (req, res) => {
  const { bankCode, accountNumber } = req.body;

  try {
    const nameEnquiryResult = await nameEnquiryReference({
      bankCode,
      accountNumber,
    });

    if (!nameEnquiryResult || !nameEnquiryResult.data.sessionId) {
      return res.status(400).send('Invalid account number or sessionId not found');
    }

    return res.status(200).json({ sessionId: nameEnquiryResult.data.sessionId });
  } catch (error) {
    console.error("Error during name enquiry:", error);
    return res.status(500).send("Internal server error");
  }
});


router.post('/transfer', authenticateUser, verifyTransactionPin, async (req, res) => {
  const { bankCode, accountNumber, amount, narration, sessionId, saveBeneficiary = false, transaction_pin } = req.body;

  const profit = 10; // Fixed ₦10 profit per transaction
  console.log(Profit);

  // Start a transaction
  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Retrieve and lock sender's virtual account for update
    const senderAccount = await VirtualAccount.findOne({
      where: { user_id: req.user.id },
      lock: transaction.LOCK.UPDATE, // Prevent race conditions
      transaction
    });

    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    // Calculate total deduction (amount + profit)
    const totalDeduction = parseFloat(amount) + profit;

    // Check for sufficient balance
    if (parseFloat(senderAccount.balance) < totalDeduction) {
      throw new Error('Insufficient balance');
    }

    // Perform the transfer
    const transferResponse = await transferFunds({
      nameEnquiryReference: sessionId,
      debitAccountNumber: senderAccount.account_number,
      beneficiaryBankCode: bankCode,
      beneficiaryAccountNumber: accountNumber,
      amount,
      narration,
      saveBeneficiary,
    });

    console.log(transferResponse);
    
    if (transferResponse.data.status !== 'Completed') {
      throw new Error('Transfer failed');
    }

    // Deduct sender's balance (only amount + profit)
    const newSenderBalance = parseFloat(senderAccount.balance) - totalDeduction;
    const newSenderMainBalance = newSenderBalance; // main_balance reflects full deduction

    await senderAccount.update(
      { 
        balance: newSenderBalance.toFixed(2), 
        main_balance: newSenderMainBalance.toFixed(2) 
      },
      { transaction }
    );

    // Retrieve receiver's account **without locking**
    const receiverAccount = await VirtualAccount.findOne({
      where: { account_number: accountNumber },
      transaction
    });

    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }

    // Add only the transferred amount to the receiver's balance
    const newReceiverBalance = parseFloat(receiverAccount.balance) + parseFloat(amount);
    const newReceiverMainBalance = newReceiverBalance;

    await receiverAccount.update(
      { 
        balance: newReceiverBalance.toFixed(2), 
        main_balance: newReceiverMainBalance.toFixed(2) 
      },
      { transaction }
    );

    // Save the transaction record
    await Transaction.create(
      {
        user_id: req.user.id,
        transaction_type: 'transfer',
        amount,
        status: 'completed',
        debit_virtual_account_id: senderAccount.id,
        details: {
          sessionId: transferResponse.data.sessionId,
          nameEnquiryReference: transferResponse.data.nameEnquiryReference,
          paymentReference: transferResponse.data.paymentReference || '',
          creditAccountName: transferResponse.data.creditAccountName,
          creditAccountNumber: transferResponse.data.creditAccountNumber,
          debitAccountName: transferResponse.data.debitAccountName,
          debitAccountNumber: transferResponse.data.debitAccountNumber,
          transactionLocation: transferResponse.data.transactionLocation,
          fees: transferResponse.data.fees,
          vat: transferResponse.data.vat,
          stampDuty: transferResponse.data.stampDuty,
          profit
        },
        reversed: false
      },
      { transaction }
    );

    const [profitRecord, created] = await Profit.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { balance: profit }
    });
    
    if (!created) {
      await profitRecord.increment('balance', { by: profit });
    }
    

    // Update remit_profit with the added profit in VirtualAccounts table
  await VirtualAccount.increment('remit_profit', {
    by: profit,
    where: { user_id: req.user.id },
    transaction
  });

    // Commit the transaction
    await transaction.commit();

    // Respond with success
    res.status(200).json({
      message: 'Transfer completed successfully',
      newBalance: newSenderBalance.toFixed(2),
      main_balance: newSenderMainBalance.toFixed(2) // Returning updated main_balance
    });
  } catch (err) {
    // Rollback transaction if an error occurs
    if (transaction) await transaction.rollback();

    // Respond with the error
    res.status(500).json({ message: 'Error completing transfer', error: err.message });
  }
});


module.exports = router;
