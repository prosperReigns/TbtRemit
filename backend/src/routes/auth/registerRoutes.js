const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../../../models');
const { VirtualAccount } = require('../../../models');
const virtualAccount = require('../../services/subAccount');
const initiateVerification = require('../../services/initiateverification');
const validateIdentity = require('../../services/validateidentity');
const externalReferenceNumber = require('../../utility/externalRef');
const { setAsync, getAsync, delAsync } = require('../../utility/redis');

const router = express.Router();

/**
 * @route   POST /register
 * @desc    Initiate user registration by storing data in Redis and returning a token
 */
router.post('/register', async (req, res) => {
    const { name, email, password, bvn, phoneNumber } = req.body;

    if (!name || !email || !password || !bvn || !phoneNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const initiateResponse = await initiateVerification({bvn});

        const identityId = initiateResponse.data._id;
        const token = crypto.randomBytes(16).toString('hex');

        await setAsync(
            `register:${token}`,
            JSON.stringify({ identityId, name, email, password, phoneNumber, bvn }),
            600
        );

        return res.status(200).json({ 
            message: 'Verification initiated successfully.', 
            token 
        });

    } catch (error) {
        console.error('Error in /register route:', error);
        return res.status(400).json({ error: error.message });
    }
});


/**
 * @route   POST /validate-otp
 * @desc    Validate OTP and complete user registration
 */
router.post('/validate-otp', async (req, res) => {
    const { otp } = req.body;
    const token = req.headers['x-registration-token'];

    try {
        let storedData = await getAsync(`register:${token}`);
        let isAdmin = false;

        if (!storedData) {
            storedData = await getAsync(`update-admin:${token}`);
            if (!storedData) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            isAdmin = true;
        }

        // Parse stored data
        const { identityId, name, email, password, phoneNumber, bvn } = JSON.parse(storedData);

        // Validate OTP
        // const isOtpValid = await verifyOtp(phoneNumber, otp);
        // if (!isOtpValid) {
        //     return res.status(400).json({ message: 'Invalid OTP' });
        // }

        // Validate user identity
        const validateResponse = await validateIdentity({ identityId, otp });
        // if (!validateResponse?.data?._id) {
        //     return res.status(400).json({ message: 'Identity validation failed' });
        // }

        const externalRef = externalReferenceNumber();

        // Create virtual account
        const subAccountResponse = await virtualAccount({
            identityId: validateResponse.data._id,
            bvn,
            otp,
            email,
            phoneNumber,
            externalRef,
        });

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

        // If NOT an admin, create user object
        let user = null;
        if (!isAdmin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                bvn,
                phoneNumber,
            });
        } else {
            // Admin already exists, retrieve admin object if needed
            user = await User.findOne({ email }); // Assuming an Admin model exists
        }

        // Store Virtual Account
        await VirtualAccount.create({
            user_id: user ? user.id : null, // Admins won't have a user object
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

        // Cleanup Redis
        await delAsync(`register:${token}`);
        await delAsync(`update-admin:${token}`);

        return res.status(201).json({
            message: isAdmin ? 'Admin identity validated and virtual account created' : 'User registered successfully',
            user: user ? { id: user.id, name: user.name, email: user.email } : null,
        });
    } catch (error) {
        console.error('Error in validate-otp route:', error);
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;