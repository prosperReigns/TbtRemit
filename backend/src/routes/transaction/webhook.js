const express = require("express");
const router = express.Router();

// router.use((req, res, next) => {
//     next();
// });

router.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    // Process the webhook data (e.g., save to database, trigger events)
    
    res.status(200).json({ message: 'Webhook received successfully' });
});

module.exports = router;