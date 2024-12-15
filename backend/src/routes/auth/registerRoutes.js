const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');
const { VirtualAccount } = require('../../../models');

const router = express.Router();

// Register API
router.post('/register', async (req, res) => {
    const { name, email, password, country } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const user = await User.create({ name, email, password: hashedPassword, country });
        console.log("User created:", user);
        // generate account number
        const accountNumber = await VirtualAccount.generateAccountNumber();
        // create virtual account
        await VirtualAccount.create({ user_id: user.id, account_number: accountNumber});
        console.log("Creating virtual account...");

        // Fetch the newly created user along with their virtual account
        const userWithAccount = await User.findOne({
            where: { id: user.id },
            include: {
            model: VirtualAccount,
            as: 'virtualAccount',
            attributes: ['account_number', 'balance'],
            },
        });

        return res.status(201).json({ message: 'User registered successfully',
            user: {
                id: userWithAccount.id,
                name: userWithAccount.name,
                email: userWithAccount.email,
                country: userWithAccount.country,
                virtualAccount: userWithAccount.virtualAccount, // Includes account_number and balance
              },
         });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = router;