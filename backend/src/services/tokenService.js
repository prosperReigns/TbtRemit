const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

let accessTokenExpiryTime = 0; // Store the expiration time of the token
let refreshTimeoutId = null; // Store the timeout ID for refresh scheduling

// Function to parse and decode a JWT
function parseJwt(token) {
  const payloadBase64 = token.split('.')[1];
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
  return payload;
}

// Function to check if the access token is expired
function isTokenExpired() {
  return Date.now() >= accessTokenExpiryTime;
}

// Function to update the .env file with new tokens
function updateTokensInEnv(access_token, refresh_token) {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envContent
      .split('\n')
      .map(line => {
        if (line.startsWith('ACCESS_TOKEN=')) {
          return `ACCESS_TOKEN=${access_token}`;
        }
        if (line.startsWith('REFRESH_TOKEN=')) {
          return `REFRESH_TOKEN=${refresh_token || process.env.REFRESH_TOKEN}`;
        }
        return line;
      })
      .join('\n');

    fs.writeFileSync('.env', updatedEnv);
    // console.log('Tokens updated in .env file.');
  } catch (error) {
    console.error('Error updating .env file:', error.message);
  }
}

// Function to set the access token and schedule its refresh
function setAccessToken(access_token, expires_in) {
  process.env.ACCESS_TOKEN = access_token;
  accessTokenExpiryTime = Date.now() + expires_in * 1000; // Set expiry time in milliseconds
  console.log(`Access token set. Expires at: ${new Date(accessTokenExpiryTime)}`);

  // Schedule token refresh
  scheduleTokenRefresh(expires_in);
}

// Function to schedule the next token refresh
function scheduleTokenRefresh(expiresIn) {
  // Clear any existing timeout
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
  }

  const refreshTime = expiresIn * 1000 - 5 * 60 * 1000; // 5 minutes before expiry
  refreshTimeoutId = setTimeout(() => {
    console.log('Refreshing token...');
    refreshToken(); // Refresh token before it expires
  }, refreshTime);

  // console.log(`Token refresh scheduled in ${refreshTime / 1000} seconds.`);
}

// Function to refresh the token using axios
async function refreshToken() {
  const options = {
    method: 'POST',
    url: `${process.env.API_BASE_URL}/oauth2/token`,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    data: {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_assertion: process.env.CLIENT_ASSERTION,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      refresh_token: process.env.REFRESH_TOKEN,
    },
  };

  try {
    const response = await axios.request(options);
    const { access_token, refresh_token, expires_in } = response.data;

    console.log('Tokens refreshed successfully.');
    // console.log('Access Token:', access_token);
    // console.log('Refresh Token:', refresh_token);

    // Update the .env file with new tokens
    updateTokensInEnv(access_token, refresh_token);

    // Set the new access token and schedule its refresh
    setAccessToken(access_token, expires_in);

    // Update runtime variables
    process.env.REFRESH_TOKEN = refresh_token || process.env.REFRESH_TOKEN;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    // Handle token refresh failure, e.g., redirect to login or exit process
  }
}

// Function to check if token needs refreshing before making API calls
async function makeApiCall() {
  if (isTokenExpired()) {
    console.log('Access token expired. Refreshing token...');
    await refreshToken();
  } else {
    console.log('Using existing access token...');
    // Proceed with your API call logic
  }
}

module.exports = makeApiCall; // Export necessary functions
