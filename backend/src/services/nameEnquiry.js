const axios = require('axios');
require('dotenv').config();

const nameEnquiryReference = async ({bankCode, accountNumber}) => {
  console.log("Bank Code:", bankCode);
  console.log("Account Number:", accountNumber);
  const requestConfig = {
    method: 'POST',
    url: `${process.env.API_BASE_URL}/transfers/name-enquiry`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      ClientID: process.env.IBS_CLIENT_ID
    },
    data: { bankCode, accountNumber },
  };

  try {
    const response = await axios.request(requestConfig);
    return response.data; 
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = nameEnquiryReference;
