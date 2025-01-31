const { Plan } = require('../models');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  async up(queryInterface, Sequelize) {
    const csvFilePath = path.join(__dirname, '../data/data-plan.csv');
    const plans = [];

    console.log('Reading CSV file...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream("../data/data-plan.csv")
        .pipe(csv())
        .on('data', (row) => {
          const amount = parseFloat(data.Amount.replace('₦', '').replace(',', ''));

          results.push({
            Plan_id: data.Plan_id,
            Network_id: data.Network_id,
            Network: data.Network,
            type: data.type,
            Amount: amount,
            Size: data.Size,
            Validity: data.Validity,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end',resolve)
        .on('error',reject);
    });

    await queryInterface.bulkInsert('Plans', results, {});
  },

  async down(queryInterface, Sequelize) {
    console.log('Rolling back plan data...');
    await Plan.destroy({ where: {}, truncate: true });
    console.log('All plan records deleted.');
  },
};
