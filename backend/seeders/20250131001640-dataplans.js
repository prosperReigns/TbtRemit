'use strict';
const fs = require('fs');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface) => {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream('data/dataplan.csv')
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            id: require('crypto').randomUUID(),  // Generate UUID for the `id` field
            data_id: parseInt(data.data_id, 10),
            network: data.network,
            plan_type: data.plan_type,
            amount: parseFloat(data.amount),
            size: data.size,
            validity: data.validity,
            selling_price: data.selling_price,
          });
        })
        .on('end', async () => {
          try {
            await queryInterface.bulkInsert('dataPlan', results, {});
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
    await queryInterface.bulkDelete('dataPlan', null, {});
  }
};
