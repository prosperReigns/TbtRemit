const axios = require('axios');
require('dotenv').config();


const getBankList = async () => {
  const options = {
    method: 'GET',
    url: `${process.env.API_BASE_URL}/transfers/banks`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      ClientID: process.env.CLIENT_ID,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = getBankList;
