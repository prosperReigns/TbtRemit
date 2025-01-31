const axios = require('axios');

// Axios Instance
const apiClient = axios.create({
  timeout: 10000, // 10 seconds timeout
});

// Error Handling Middleware
const handleConnectionErrors = (err, req, res, next) => {
  if (err.code === 'ETIMEDOUT') {
    console.error('Error: Request timed out.');
    return res.status(504).json({ error: 'Request timed out. Please try again later.' });
  }
  if (err.code === 'ENETUNREACH') {
    console.error('Error: Network unreachable.');
    return res.status(503).json({ error: 'Network unreachable. Please check your connection.' });
  }
  console.error('Unexpected error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
};