const axios = require('axios');

const options = {
  method: 'GET',
  url: `${process.env.API_BASE_URL}/?page=0&limit=100`,
  headers: {accept: 'application/json',
    Authorization: `Bearer ${process.env.AUTHORIZATION_TOKEN}`,
    ClientID: process.env.IBS_CLIENT_ID,
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));

module.exports = { options };