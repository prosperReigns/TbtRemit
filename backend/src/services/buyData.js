const axios = require('axios');
require('dotenv').config();

// Buy Data (POST request)
const buyData = async (network_id, plan_id, phoneNumber) => {
  const data = {
    network: network_id,
    mobile_number: phoneNumber, // Example phone number
    plan: plan_id,
    Ported_number: true
  };

  const options = {
    method: 'POST',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/data/`,
    headers: {
      'Authorization': `Token ${process.env.DATA_STORAGE_TOKEN}`, 
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get All Data Purchase (GET request)
const getAllDataPurchase = async () => {
  const options = {
    method: 'GET',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/data/`,
    headers: {
      'Authorization': `Token ${process.env.DATA_STORAGE_TOKEN}`
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get One Data Purchase by ID (GET request)
const getOneDataPurchase = async (dataId) => {
  const options = {
    method: 'GET',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/data/${dataId}`,
    headers: {
      'Authorization': `Token ${process.env.DATA_STORAGE_TOKEN}`
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  buyData,
  getAllDataPurchase,
  getOneDataPurchase
};
