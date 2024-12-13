// Server entry point
const app = require('./app');
const { Sequelize } = require('sequelize');
const { execSync } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Main function to start the server
const startServer = async () => {
  try {
    // console.log('Starting server...');
    
    // Step 1: Apply migrations
    // console.log('Applying migrations...');
    // execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' }); // Run migrations

    // Step 2: Verify database connection
    const config = require(path.resolve(__dirname, '../config/config.js'))[process.env.NODE_ENV || 'development']; // Load DB config
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    await sequelize.authenticate();
    console.log('Database connected successfully!');

    // Step 3: Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // Exit with failure code if something goes wrong
  }
};

// Call the function to start the server
startServer();
