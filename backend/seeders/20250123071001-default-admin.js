'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('adminPassword123', 10);

    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(), 
        name: 'Super Admin', 
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        bvn: '12345678901',
        phoneNumber: '08012345678',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', { email: 'admin@example.com' });
  },
};
