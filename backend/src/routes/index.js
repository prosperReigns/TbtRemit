const express = require('express');
const registerRoute = require('./auth/registerRoutes');
const loginLogoutRoute = require('./auth/loginLogout');
const transferRoute = require('./transaction/transfer');
const airtimeRoute = require('./transaction/airtime');
const cableRoute= require('./transaction/cable');
const utilityRoute= require('./transaction/utilityBill');
const dashboardRoute= require('./dashboard/profile');
const router = express.Router();

router.use('/auth', registerRoute);
router.use('/auth', loginLogoutRoute); 
router.use('/transactions', transferRoute);
router.use('/transactions', airtimeRoute);
router.use('/transactions', cableRoute);
router.use('/transactions', utilityRoute);
router.use('/dashboard', dashboardRoute);
module.exports = router;
