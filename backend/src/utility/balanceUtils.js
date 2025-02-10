const { CablePlan } = require('../../models');

/**
 * Retrieve cable plan details including cablePlan_id and cableName_id
 * @param {string} cablename - The name of the cable provider
 * @param {string} cableplan - The specific cable plan
 * @returns {Promise<object|null>} - Returns an object with cablePlan_id and cableName_id or null if not found
 */
const getCablePlanDetails = async (cablename, cableplan) => {
  const plan = await CablePlan.findOne({
    where: { name: cableplan },
    attributes: ['id', 'cableName_id'],
  });

  if (!plan) return null;

  return {
    cablePlan_id: plan.id,
    cableName_id: plan.cableName_id,
  };
};

module.exports = getCablePlanDetails;
