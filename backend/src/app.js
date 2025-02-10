// Express application setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const makeApiCall = require('./services/tokenService');
const scheduleMonthlyPayouts = require('../src/services/processProfitPayout');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
    try {
      await makeApiCall(); // Check and refresh token if needed
      next(); // Continue to the route handler if token is valid
    } catch (err) {
      console.error('Error in token check middleware:', err);
      res.status(500).send('Error refreshing token');
    }
  });

app.get('/api/data', (req, res) => res.json({ message: 'Hello from API!' }));
app.use('/api', routes); 


module.exports = app;