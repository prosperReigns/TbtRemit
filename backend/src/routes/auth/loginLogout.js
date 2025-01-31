const express = require('express');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

const router = express.Router();

// Secret key for JWT (use environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET;

// Login API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Logout API
router.post('/logout', async (req, res) => {
    try {
      const userId = req.user.id; // Ensure `req.user` is set by middleware
      await User.update({ lastLogoutAt: new Date() }, { where: { id: userId } });
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });
module.exports = router;
