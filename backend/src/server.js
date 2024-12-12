const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Server is running!'));

app.get('/api/data', (req, res) => res.json({ message: 'Hello from API!' }));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
