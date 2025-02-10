const { createClient } = require('redis');

// Create Redis client
const client = createClient();

client.on('error', (err) => console.error('Redis Error:', err));

// Connect Redis inside an async function
const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

// Call the function to connect
connectRedis();

// Set key with expiration
const setAsync = async (key, value, expiration) => {
  try {
    await client.setEx(key, expiration, value);
  } catch (error) {
    console.error(`Redis setAsync error: ${error.message}`);
  }
};

// Get key
const getAsync = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Redis getAsync error: ${error.message}`);
    return null;
  }
};

// Delete key
const delAsync = async (key) => {
  try {
    await client.del(key);
  } catch (error) {
    console.error(`Redis delAsync error: ${error.message}`);
  }
};

module.exports = { client, setAsync, getAsync, delAsync };
