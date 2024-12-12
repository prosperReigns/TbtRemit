// Server entry point
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');



const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
      await connectDB();

      await sequelize.sync({ alter: true }); // Alter the tables if necessary
      console.log('All models were synchronized successfully.');
  
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Error starting the server:', error);
    }
  };
  
startServer();
