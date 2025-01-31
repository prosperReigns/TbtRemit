const express = require('express');
const { Transaction } = require('../../models');
const { checkAdmin } = require('../../middleware/checkRole');

const router = express.Router();

/**
 * Retrieves all transactions from the database.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object with the following properties:
 *   - status: The HTTP status code (200 for success, 500 for server error).
 *   - body: An object containing either:
 *     - transactions: An array of all transaction objects (for successful requests).
 *     - message: A string describing the error (for error responses).
 *     - error: The error message (for server errors).
 */
router.get('/transactions', checkAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    return res.status(200).json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});



/**
 * Retrieves a specific transaction by its ID.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {string} req.params.id - The ID of the transaction to retrieve.
 *
 * @returns {object} The response object with the following properties:
 * - status: The HTTP status code (200 for success, 404 for not found, 500 for server error).
 * - body: An object containing either:
 *   - transaction: The retrieved transaction object (for successful requests).
 *   - message: A string describing the error (for error responses).
 *   - error: The error message (for server errors).
 */
router.get('/transactions/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the transaction by its ID
    const transaction = await Transaction.findOne({ where: { id } });

    // Check if the transaction exists
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Return the transaction details
    return res.status(200).json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});


// Reverse a failed transaction
/**
 * Reverses a failed transaction.
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {string} req.params.id - The ID of the transaction to be reversed
 * @param {string} req.body.reversal_reason - The reason for reversing the transaction
 *
 * @returns {object} - The response object with the following properties:
 * - status: The HTTP status code (200 for success, 404 for transaction not found, 400 for invalid transaction status or already reversed, 500 for server error)
 * - body: An object containing the following properties:
 *   - message: A message indicating the outcome of the operation
 *   - transaction: The reversed transaction object (only present when the operation is successful)
 *
 * @throws Will throw an error if the transaction ID is not provided or the transaction cannot be found.
 * @throws Will throw an error if the transaction status is not 'failed'.
 * @throws Will throw an error if the transaction has already been reversed.
 * @throws Will throw an error if there is an issue reversing the transaction or saving the updated transaction.
 */
router.post('/transactions/:id/reverse', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { reversal_reason } = req.body;

  try {
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'failed') {
      return res.status(400).json({ message: 'Only failed transactions can be reversed' });
    }

    if (transaction.reversed) {
      return res.status(400).json({ message: 'Transaction has already been reversed' });
    }

    // Logic to reverse transaction (e.g., refund the user)
    // Example: refunding the user's balance
    const user = await transaction.getUser();
    user.balance += transaction.amount;
    await user.save();

    // Mark transaction as reversed
    transaction.reversed = true;
    transaction.reversal_reason = reversal_reason || 'No reason provided';
    await transaction.save();

    return res.status(200).json({
      message: 'Transaction reversed successfully',
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error reversing transaction', error: error.message });
  }
});

module.exports = router;
