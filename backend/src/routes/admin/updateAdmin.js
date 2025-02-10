const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');
const initiateVerification = require('../../services/initiateverification');
const authenticateUser = require('../../middleware/authenticator');
const checkRole = require('../../middleware/userRole');
const crypto = require('crypto');
const { setAsync } = require('../../utility/redis');


const router = express.Router();


router.post('/update-admin', authenticateUser, checkRole(['admin']), async (req, res) => {
    try {
        const { name, email, password, bvn, phoneNumber } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ error: "User ID is missing from request." });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: "Admin user not found." });
        }

        let updatedName = name || user.name;
        let updatedEmail = email || user.email;
        let updatedPhoneNumber = phoneNumber || user.phoneNumber;
        let updatedBvn = bvn || user.bvn;
        let updatedPassword = password || user.password;
        let hashedPassword = updatedPassword ? await bcrypt.hash(updatedPassword, 10) : user.password;
        let identityId = "";

        if (bvn && bvn !== user.bvn) {
            const initiateResponse = await initiateVerification({ bvn: updatedBvn });
            identityId = initiateResponse.data._id;
        }

        // Generate a token for OTP validation
        const token = crypto.randomBytes(16).toString('hex');
        await setAsync(
            `update-admin:${token}`,
            JSON.stringify({ identityId, name: updatedName,
                email: updatedEmail, password: updatedPassword, phoneNumber: updatedPhoneNumber, bvn: updatedBvn }),
            600
        );

        // Update admin details
        await user.update({
            name: name || user.name,
            email: email || user.email,
            password: hashedPassword,
            bvn: bvn || user.bvn,
            phoneNumber: phoneNumber || user.phoneNumber,
        });

        return res.status(200).json({
            message: "Admin information updated. OTP validation required.",
            token
        });

    } catch (error) {
        console.error("Error in /update-admin:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;













// const express = require('express');
// const bcrypt = require('bcryptjs');
// const { User } = require('../../../models');
// const initiateVerification = require('../../services/initiateverification');
// const authenticateUser = require('../../middleware/authenticator');
// const checkRole = require('../../middleware/userRole');
// const crypto = require('crypto');

// const router = express.Router();
// const tempStorage = {}; 

// router.post('/update-admin', authenticateUser, checkRole(['admin']), async (req, res) => {
//     const { name, email, password, bvn, phoneNumber } = req.body;
//     const userId = '00000000';

//     try {
//         const user = await User.findOne({ where: { id: userId } });

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         let hashedPassword = user.password;
//         if (password) {
//             hashedPassword = await bcrypt.hash(password, 10);
//         }

//         let identityId = user.identityId;
//         if (bvn && bvn !== user.bvn) {
//             const initiateResponse = await initiateVerification(bvn);
//             console.log('Initiate Response:', initiateResponse);
//             identityId = initiateResponse.data._id;
//         }

//         // Generate a token for verification tracking
//         const token = crypto.randomBytes(16).toString('hex');

//         // Store verification data in tempStorage
//         tempStorage[token] = { identityId, name, email, password, phoneNumber, bvn };

//         // Update user details
//         await user.update({
//             name: name || user.name,
//             email: email || user.email,
//             password: hashedPassword,
//             bvn: bvn || user.bvn,
//             phoneNumber: phoneNumber || user.phoneNumber,
//         });

//         return res.status(200).json({ 
//             message: "User information updated successfully. OTP validation required.", 
//             token  // Send token to frontend
//         });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });


// module.exports = router;
