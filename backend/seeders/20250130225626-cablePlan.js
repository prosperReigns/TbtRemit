'use strict';
const fs = require('fs');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface) => {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream('data/cableplans.csv')  // Adjust the path if necessary
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            id: require('crypto').randomUUID(),  // Generate UUID for the `id` field
            cablePlan_id: parseInt(data.cablePlan_id, 10),
            cableName_id: parseInt(data.cableName_id, 10),
            name: data.name,
            amount: parseFloat(data.amount),
            selling_price: parseFloat(data.selling_price),
          });
        })
        .on('end', async () => {
          try {
            await queryInterface.bulkInsert('cablePlan', results, {});  // Correct use of queryInterface to insert data
            console.log('CSV data imported successfully!');
            resolve();
          } catch (error) {
            console.error('Error importing CSV data:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface) => {
    // To undo the seeding operation, remove all data in the CablePlans table
    await queryInterface.bulkDelete('cablePlan', null, {});
  }
};
