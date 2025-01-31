const axios = require('axios');
require('dotenv').config();

const transferFunds = async ({
  nameEnquiryReference,
  debitAccountNumber,
  beneficiaryBankCode,
  beneficiaryAccountNumber,
  amount,
  narration,
  saveBeneficiary
}) => {

  const options = {
    method: 'POST',
    url: `${process.env.API_BASE_URL}/transfers`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      ClientID: process.env.IBS_CLIENT_ID
    },
    data: {
      nameEnquiryReference,
      debitAccountNumber,
      beneficiaryBankCode,
      beneficiaryAccountNumber,
      amount,
      narration,
      saveBeneficiary,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = transferFunds;
