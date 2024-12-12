const { Sequelize } = require('sequelize');

// Load environment variables
require('dotenv').config();

// Create a Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Disable SQL query logging; enable for debugging if needed
});

// Test the database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = { sequelize, connectDB };
