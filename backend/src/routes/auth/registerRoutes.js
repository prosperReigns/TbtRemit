const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');

const router = express.Router();

// Register API
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const user = await User.create({ name, email, password: hashedPassword });

        return res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = router;
