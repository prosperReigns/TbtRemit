// Express application setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => res.json({ message: 'Hello from API!' }));
app.use('/api', routes); 


module.exports = app;