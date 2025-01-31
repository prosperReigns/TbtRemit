const jwt = require('jsonwebtoken');
const { User } = require('../../models'); // Adjust to your DB models
require('dotenv').config();

// Middleware to authenticate the user
const authenticateUser = async (req, res, next) => {
  try {
    
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) return res.status(401).send('Unauthorized');
    
    if (new Date(decoded.iat * 1000) < new Date(user.lastLogoutAt)) {
      return res.status(401).send('Token is no longer valid');
  }
    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send('Invalid token');
    }

    res.status(401).send('Unauthorized');
  }
};

module.exports = authenticateUser;
