const axios = require('axios');
require('dotenv').config();

// Endpoint to buy airtime
const buyAirtime = async (network_id, amount, phone) => {
  const data = {
    network: network_id,
    amount: amount,
    mobile_number: phone,
    Ported_number: true,
    airtime_type: 'VTU',
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/topup/`,
    headers: { 
      'Authorization': `Token ${process.env.DATA_STORAGE_TOKEN}`, // Use environment variable for token
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
    throw new Error('Error buying airtime');
  }
};

// Endpoint to get airtime purchase transaction
const getAllAirtimePurchase = async (id) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/data/${id}`, // Assuming 'id' is dynamic here
    headers: { 
      'Authorization': `Token ${process.env.DATA_STORAGE_TOKEN}`, // Use environment variable for token
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching airtime purchase transactions');
  }
};

module.exports = {
  buyAirtime,
  getAllAirtimePurchase,
};
