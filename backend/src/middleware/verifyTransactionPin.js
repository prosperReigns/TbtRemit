const { User } = require('../../models'); // Adjust the path if necessary

// Middleware to verify transaction pin
async function verifyTransactionPin(req, res, next) {
  const { transaction_pin } = req.body;

  // Validate the pin input
  if (!transaction_pin) {
    return res.status(400).json({ message: 'Transaction pin is required to confirm this transaction.' });
  }

  if (!/^\d{4}$/.test(transaction_pin)) {
    return res.status(400).json({ message: 'Transaction pin must be a 4-digit number.' });
  }

  // Verify the transaction pin
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPinValid = await user.verifyTransactionPin(transaction_pin);

    if (!isPinValid) {
      return res.status(400).json({ message: 'Invalid transaction pin' });
    }

    // Pin is valid, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error verifying transaction pin:', error);
    return res.status(500).json({ message: 'Error verifying transaction pin', error: error.message });
  }
}

module.exports = verifyTransactionPin;
