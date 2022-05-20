const fetch = require("node-fetch");
const functions = require("firebase-functions");
require("dotenv").config();

/**
 * Get BS product feed
 * @return {object} Product feed
 */
exports.getBSStockData = async function() {
  const {BS_API_URL, BS_API_KEY} = process.env;

  const urlSearch = BS_API_URL;
  const paramsSearch = new URLSearchParams({
    code: BS_API_KEY,
  });

  const responseProductFeed = await fetch(urlSearch + paramsSearch);
  const productFeed = await responseProductFeed.json();

  if (!productFeed) {
    functions.logger.info("Could not load BS product feed", productFeed, {
      structuredData: true,
    });
  }

  return productFeed;
};


