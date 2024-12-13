const express = require('express');
const userRoutes = require('./userRoutes');
const registerRoute = require('./auth/registerRoutes');
const loginLogoutRoute = require('./auth/loginLogout');
const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', registerRoute);
router.use('/auth', loginLogoutRoute); 

module.exports = router;
