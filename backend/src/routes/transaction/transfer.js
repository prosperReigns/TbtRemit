const express = require('express');
const transferFunds = require('../../services/transferservices');
const getBankList = require('../../services/bankList');
const nameEnquiryReference = require('../../services/nameEnquiry');
const authenticateUser = require('../../middleware/authenticator');
const verifyTransactionPin = require('../../middleware/verifyTransactionPin');
const { checkAndDeductBalance } = require('../../utility/balanceUtils');
const { logTransaction } = require('../../utility/transactionUtils');
const { VirtualAccount, Transaction } = require('../../../models');

const router = express.Router();

router.use(authenticateUser);

router.post('/bank-list', async (req, res) => {
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

router.post('/name-enquiry', async (req, res) => {
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


// router.post('/transfer', verifyTransactionPin, async (req, res) => {
//   const { bankCode, accountNumber, amount, narration, transaction_pin, sessionId, saveBeneficiary = false } = req.body;

  
//   const transaction = await VirtualAccount.sequelize.transaction();
//   try {
//     // Deduct balance and get the new balance (sender's account)
//     const newBalance = await checkAndDeductBalance(req.user.id, amount, transaction);

//     const virtualAccount = await VirtualAccount.findOne({ where: { user_id: req.user.id } });
//     if (!virtualAccount) {
//       return res.status(404).send('Virtual account not found for user');
//     }

//     // console.log('req.user:', req.user);
//     console.log('User Account Number:', virtualAccount.account_number);
//     console.log(`...${sessionId}...${req.user.account_number}...${bankCode}...${accountNumber}...${amount}...${narration}...${saveBeneficiary}`);
    

//     // Perform the transfer
//     const transferResponse = await transferFunds({
//       nameEnquiryReference: sessionId,
//       debitAccountNumber: virtualAccount.account_number,
//       beneficiaryBankCode: bankCode,
//       beneficiaryAccountNumber: accountNumber,
//       amount,
//       narration,
//       saveBeneficiary
//     });

//     console.log('Transfer Response:', transferResponse);
//     // Check transfer status (assuming transferResponse has status)
//     if (transferResponse.data.status !== 'Completed') {
//       throw new Error('Transfer failed');
//     }

//     // Update receiver's balance
//     const beneficiaryAccount = await VirtualAccount.findOne({
//       where: { account_number: accountNumber },
//       transaction,
//     });

//     if (beneficiaryAccount) {
//       // Add the amount to the receiver's balance
//       beneficiaryAccount.balance += amount;
//       await beneficiaryAccount.save({ transaction });
//     } else {
//       throw new Error('Receiver account not found');
//     }

//     // Log the transaction with the detailed response data
//     await logTransaction({
//       user_id: req.user.id,
//       transaction_type: 'transfer',
//       amount,
//       status: 'completed',
//       debit_virtual_account_id: virtualAccount.id,
//       details: {
//         sessionId: transferResponse.data.sessionId,
//         nameEnquiryReference: transferResponse.data.nameEnquiryReference,
//         paymentReference: transferResponse.data.paymentReference || '',
//         creditAccountName: transferResponse.data.creditAccountName,
//         creditAccountNumber: transferResponse.data.creditAccountNumber,
//         debitAccountName: transferResponse.data.debitAccountName,
//         debitAccountNumber: transferResponse.data.debitAccountNumber,
//         transactionLocation: transferResponse.data.transactionLocation,
//         fees: transferResponse.data.fees,
//         vat: transferResponse.data.vat,
//         stampDuty: transferResponse.data.stampDuty,
//       },
//     }, transaction);

//     // Save the transaction to the Transaction table with complete details
//     const newTransaction = await Transaction.create({
//       user_id: req.user.id,
//       transaction_type: 'transfer',
//       amount,
//       status: 'completed',
//       debit_virtual_account_id:  virtualAccount.id,
//       details: {
//         sessionId: transferResponse.data.sessionId,
//         nameEnquiryReference: transferResponse.data.nameEnquiryReference,
//         paymentReference: transferResponse.data.paymentReference || '',
//         creditAccountName: transferResponse.data.creditAccountName,
//         creditAccountNumber: transferResponse.data.creditAccountNumber,
//         debitAccountName: transferResponse.data.debitAccountName,
//         debitAccountNumber: transferResponse.data.debitAccountNumber,
//         transactionLocation: transferResponse.data.transactionLocation,
//         fees: transferResponse.data.fees,
//         vat: transferResponse.data.vat,
//         stampDuty: transferResponse.data.stampDuty,
//       },
//       reversed: false,
//       transaction,
//     });

//     // Commit the transaction
//     await transaction.commit();

//     res.status(200).json({
//       message: 'Transfer completed successfully',
//       newBalance,
//       transactionId: newTransaction.id,
//     });
//   } catch (err) {
//     if (transaction) await transaction.rollback();
//     res.status(500).json({ message: 'Error completing transfer', error: err.message });
//   }
// });


router.post('/transfer', verifyTransactionPin, async (req, res) => {
  const { bankCode, accountNumber, amount, narration, sessionId, saveBeneficiary = false } = req.body;

  // Start a transaction
  const transaction = await VirtualAccount.sequelize.transaction();
  try {
    // Retrieve the sender's virtual account (assumes user authentication is in place)
    const senderAccount = await VirtualAccount.findOne({ 
      where: { user_id: req.user.id },
      transaction 
    });

    // Check for sufficient balance
    if (senderAccount.balance < amount) {
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
    
    // Ensure the transfer was successful
    if (transferResponse.data.status !== 'Completed') {
      throw new Error('Transfer failed');
    }

    // Deduct sender's balance
    senderAccount.balance = (parseFloat(senderAccount.balance) - parseFloat(amount)).toFixed(2);
    await senderAccount.save({ transaction });

    // Update receiver's balance
    const receiverAccount = await VirtualAccount.findOne({ 
      where: { account_number: accountNumber },
      transaction 
    });

    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }
    
    // Add the transferred amount to the receiver's balance
    receiverAccount.balance = (parseFloat(receiverAccount.balance) + parseFloat(amount)).toFixed(2);
    await receiverAccount.save({ transaction });

    // Log the transaction
    await logTransaction(
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
        },
      },
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    // Respond with success
    res.status(200).json({
      message: 'Transfer completed successfully',
      newBalance: senderAccount.balance,
    });
  } catch (err) {
    // Rollback transaction if an error occurs
    if (transaction) await transaction.rollback();

    // Respond with the error
    res.status(500).json({ message: 'Error completing transfer', error: err.message });
  }
});


module.exports = router;
