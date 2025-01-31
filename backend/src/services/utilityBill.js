const axios = require('axios');
require('dotenv').config();

// Endpoint to pay electricity bills
const payElectricityBill = async (discoName, amount, meterNumber, meterType) => {
  const data = {
    disco_name: discoName,
    amount: amount,
    meter_number: meterNumber,
    MeterType: meterType, // 1 for PREPAID, 2 for POSTPAID
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/billpayment/`, // API base URL from environment variable
    headers: {
      Authorization: `Token ${process.env.DATA_STORAGE_TOKEN}`, // Token from environment variable
      'Content-Type': 'application/json',
    },
    data: data,
  };

  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error processing electricity bill payment');
  }
};

// Endpoint to get electricity bill payment details
const getElectricityBillDetails = async (id) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/billpayment/${id}`, // Dynamic ID for bill payment
    headers: {
      Authorization: `Token ${process.env.DATA_STORAGE_TOKEN}`, // Token from environment variable
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
    //throw new Error('Error fetching electricity bill payment details');
  }
};

module.exports = {
  payElectricityBill,
  getElectricityBillDetails,
};
