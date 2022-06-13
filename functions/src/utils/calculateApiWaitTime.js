const functions = require("firebase-functions");
const {wait} = require("../utils/wait");

/**
   * Calcualtes the wait time for next api call -> https://shopify.dev/api/usage/rate-limits#graphql-admin-api-rate-limits
   * @param {string} queryCost The query cost informaiton from api response
   * @return {Promise<string>} The ms to wait
   */
exports.calculateApiWaitTime = async (queryCost) => {
  try {
    // If not query cost is defined return 10 sec
    if (!queryCost) {
      functions.logger.warn("No query cost defined", {
        structuredData: true,
      });

      return await wait(10000);
    }

    // wait because of graphql request limit rate
    if (queryCost.requestedQueryCost > (queryCost.throttleStatus.currentlyAvailable - queryCost.throttleStatus.restoreRate)) {
      // const diff = queryCost.throttleStatus.currentlyAvailable-queryCost.requestedQueryCost;
      // const waitTime = diff*1000/queryCost.throttleStatus.restoreRate;
      // console.log(waitTime);
      return await wait(5000);
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

