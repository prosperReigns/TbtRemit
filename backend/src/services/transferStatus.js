const axios = require('axios');

const options = {
  method: 'POST',
  url: `${process.env.API_BASE_URL}transfers/status`,
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `Bearer ${process.env.AUTHORIZATION_TOKEN}`,
    ClientID: process.env.IBS_CLIENT_ID
},
  data: {sessionId: 'string'}
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));

module.exports = { options };