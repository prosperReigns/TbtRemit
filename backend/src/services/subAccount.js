const axios = require('axios');
require('dotenv').config();

const virtualAccount = async ({identityId, bvn, otp, email, phoneNumber, externalRef}) => {
    const emailAddress = String(email);
    bvn = String(bvn);
    phoneNumber = String(phoneNumber);
    otp = String(otp);
    identityId = String(identityId);
    const externalReference = String(externalRef);
    

  const requestConfig = {
    method: 'POST',
    url: `${process.env.API_BASE_URL}/accounts/v2/subaccount`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      ClientID: process.env.IBS_CLIENT_ID,
    },
    data: {
      phoneNumber, 
      emailAddress,
      externalReference,
      identityType: 'BVN',
      identityNumber: bvn,
      identityId,
      otp
      },
    };

  try {
    const response = await axios.request(requestConfig);
    return response.data;
  } catch (error) {
    console.error('Error creating virtual account:', error.message);
    throw error;
  }
};

module.exports = virtualAccount;
