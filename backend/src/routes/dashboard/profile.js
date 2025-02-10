const express = require('express');
const authenticateUser = require('../../middleware/authenticator');
const getUserFromDb = require('../../middleware/getUserFromDb');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');

const router = express.Router();
router.use(getUserFromDb);

//1. View Profile (GET)
router.get('/profile', authenticateUser, (req, res) => {
  return res.status(200).json({
    message: 'User profile fetched successfully',
    data: req.userData,
  });
});

// 2. Update Profile (PATCH)
router.patch('/change-password', authenticateUser, async (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: 'Both old and new passwords are required' });
  }

  try {
    // Validate old password
    const isValidPassword = await req.userData.validatePassword(old_password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password and update the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update the password field
    await req.userData.update({ password: hashedPassword });

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating password', error: error.message });
  }
});


// 3x. Set Transaction Pin (POST)
router.post('/set-transaction-pin', authenticateUser, async (req, res) => {
  const { transaction_pin } = req.body;

  // Validate if the transaction pin is provided
  if (!transaction_pin) {
    return res.status(400).json({ message: 'Transaction pin cannot be null or empty' });
  }

  // Ensure the transaction pin is exactly 4 digits
  if (!/^\d{4}$/.test(transaction_pin)) {
    return res.status(400).json({ message: 'Transaction pin must be a 4-digit number.' });
  }

  try {
    await req.userData.setTransactionPin(transaction_pin);
    await req.userData.save();

    return res.status(200).json({
      message: 'Transaction pin set successfully',
    });
  } catch (error) {
    console.error('Error setting transaction pin:', error);
    return res.status(500).json({
      message: 'Error setting transaction pin',
      error: error.message,
    });
  }
});


router.patch('/update-transaction-pin', authenticateUser, async (req, res) => {
  const { transaction_pin } = req.body;

  if (!transaction_pin) {
    return res.status(400).json({ message: 'Transaction pin is required' });
  }

  try {
    // Hash the transaction pin before saving it
    await req.userData.setTransactionPin(transaction_pin);

    // Update the transaction pin field
    await req.userData.update({ transaction_pin: req.userData.transaction_pin });

    return res.status(200).json({
      message: 'Transaction pin updated successfully',
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction pin', error: error.message });
  }
});

module.exports = router;
