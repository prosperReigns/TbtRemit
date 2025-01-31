const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For generating unique token
const { User } = require('../../../models');
const { VirtualAccount } = require('../../../models');
const virtualAccount = require('../../services/subAccount');
const initiateVerification = require('../../services/initiateverification');
const validateIdentity = require('../../services/validateidentity');
const externalReferenceNumber = require('../../utility/externalRef');

const router = express.Router();

const tempStorage = {}; 

// Register API
router.post('/register', async (req, res) => {
    const { name, email, password, bvn, phoneNumber } = req.body;

    if (!name || !email || !password || !bvn || !phoneNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const initiateResponse = await initiateVerification(bvn);
        console.log('Initiate Response:', initiateResponse);
        

        const identityId = initiateResponse.data._id;

        // Generate a unique token for tracking the registration process
        const token = crypto.randomBytes(16).toString('hex');

        // Store token and associated data in temporary storage
        tempStorage[token] = { identityId, name, email, password, phoneNumber, bvn };

        return res.status(200).json({
            message: 'Verification initiated successfully. Please provide the OTP.',
            token, // Send token to the frontend
        });
    } catch (error) {
        console.error('Error in register route:', error);
        return res.status(400).json({ error: error.message });
    }
});

router.post('/validate-otp', async (req, res) => {
    const { otp } = req.body;
    const token = req.headers['x-registration-token']; // Retrieve token from headers

    try {
        // Ensure the token exists in temporary storage
        if (!tempStorage[token]) {
            return res.status(404).json({ error: 'Invalid or expired registration token. Please restart the process.' });
        }

        const { identityId, name, email, password, phoneNumber, bvn } = tempStorage[token];

        // Validate identity using OTP
        const validateResponse = await validateIdentity({ identityId, otp });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const user = await User.create({ name, email, password: hashedPassword, bvn, phoneNumber });

        externalRef = externalReferenceNumber();
        //console.log(externalRef);

        // Create a virtual account
        const subAccountResponse = await virtualAccount({
            identityId: validateResponse.data._id,
            bvn,
            otp,
            email,
            phoneNumber,
            externalRef,
        });
        //console.log('SubAccount Response:', subAccountResponse);

        const {
            accountNumber,
            accountName,
            accountType,
            currencyCode,
            bvn: responseBvn,
            status,
            nominalAnnualInterestRate,
            isDefault,
            lockinPeriodFrequency,
            allowOverdraft,
            chargeWithHoldingTax,
            chargeValueAddedTax,
            chargeStampDuty,
            cbaAccountId,
        } = subAccountResponse.data;

        const accountId = subAccountResponse.data._id;

        await VirtualAccount.create({
            user_id: user.id,
            account_number: accountNumber,
            account_name: accountName,
            account_type: accountType,
            currency_code: currencyCode,
            bvn: responseBvn,
            status,
            nominal_annual_interest_rate: nominalAnnualInterestRate,
            is_default: isDefault,
            lockin_period_frequency: lockinPeriodFrequency,
            allow_overdraft: allowOverdraft,
            charge_with_holding_tax: chargeWithHoldingTax,
            charge_value_added_tax: chargeValueAddedTax,
            charge_stamp_duty: chargeStampDuty,
            cba_account_id: cbaAccountId,
            account_id: accountId,
        });

        // Remove temporary storage for token
        delete tempStorage[token];

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error in validate-otp route:', error);
        return res.status(400).json({ error: error.message });
    }
});


module.exports = router;