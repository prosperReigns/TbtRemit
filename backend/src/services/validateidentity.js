const axios = require('axios');
require('dotenv').config();

const validateIdentity = async ({ identityId, otp }) => {
    const requestConfig = {
    method: 'POST',
    url: `${process.env.API_BASE_URL}/identity/v2/validate`,
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        ClientID: process.env.IBS_CLIENT_ID,
    },
    data: {
        identityId: identityId,
        type: 'BVN',
        otp: otp
        }
    };

try {
      const response = await axios.request(requestConfig);
      return response.data; // Return the response for further use
    } catch (error) {
      console.error('Error validating identity:', error.message);
      throw error; // Propagate the error for the caller to handle
    }
}

module.exports = validateIdentity;