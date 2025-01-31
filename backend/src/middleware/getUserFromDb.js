const { User } = require('../../models');

const getUserFromDb = async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: ['id', 'name', 'email', 'phoneNumber', 'password', 'transaction_pin'],
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      req.userData = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
  };

  module.exports = getUserFromDb;