const { CablePlan } = require('../../models'); // Assuming your CablePlan model is defined here

/**
 * Get the cable plan details including cablePlan_id
 * @param {string} cablename - The name of the cable service (e.g., DStv, GOtv).
 * @param {string} cableplan - The specific plan under the cable service (e.g., DStv Yanga).
 * @returns {Promise<object|null>} Returns the cable plan details if found, otherwise null.
 */
const getCablePlanDetails = async (cablename, cableplan) => {
  return await CablePlan.findOne({
    where: { name: cableplan },  // Assuming 'name' is the column for the plan name
    attributes: ['cablePlan_id', 'amount', 'seling_price'], // Fetch necessary fields
  });
};

module.exports = getCablePlanDetails;
