const axios = require('axios');
require('dotenv').config();

// Endpoint to subscribe to cable services
const subscribeToCable = async (cablenameId, cableplanId, smartCardNumber) => {
  const data = {
    cablename: cablenameId,
    cableplan: cableplanId,
    smart_card_number: smartCardNumber,
  };

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/cablesub/`, // API base URL from environment variable
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
    throw new Error('Error subscribing to cable service');
  }
};

// Endpoint to get cable subscription details
const getCableSubscriptionDetails = async (id) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${process.env.API_BASE_URL_2}/cablesub/${id}`, // Dynamic ID for cable subscription
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
    throw new Error('Error fetching cable subscription details');
  }
};

module.exports = {
  subscribeToCable,
  getCableSubscriptionDetails,
};
