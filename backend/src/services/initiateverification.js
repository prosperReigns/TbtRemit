const axios =  require('axios');
require('dotenv').config();

const initiateVerification = async ({bvn}) => {
    const requestConfig = {
      method: 'POST',
      url: `${process.env.API_BASE_URL}/identity/v2`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        ClientID: process.env.IBS_CLIENT_ID,
      },
      data: {
        type: 'BVN',
        number: bvn,
        debitAccountNumber: '0118058436'
      },
    };
  
    try {
      const response = await axios.request(requestConfig);
      return response.data;
    } catch (error) {
      throw error;
    }
};

module.exports =  initiateVerification ;