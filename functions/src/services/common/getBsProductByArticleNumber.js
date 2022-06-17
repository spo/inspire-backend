const fetch = require("node-fetch");
const functions = require("firebase-functions");
require("dotenv").config();

/**
 * Get BS product variant by article number
 * @param {string} articleNumber The BS article Number (e.g. O-N2-186-B5)
 * @return {object} BS Product variant
 */
exports.getBsProductByArticleNumber = async function(articleNumber) {
  const {BS_API_URL, BS_API_KEY} = process.env;

  const urlSearch = BS_API_URL;
  const paramsSearch = new URLSearchParams({
    code: BS_API_KEY,
    articleNumber: articleNumber,
  });

  const responseProductFeed = await fetch(urlSearch + paramsSearch);
  const productVariant = await responseProductFeed.json();

  if (!productVariant) {
    throw new functions.https.HttpsError("aborted", "More than one product found for the given article number.", "articleNumber-duplicate");
  }

  if (!productVariant) {
    functions.logger.info("Could not load BS product feed", productVariant, {
      structuredData: true,
    });
  }

  if (!productVariant.products.length > 0) {
    functions.logger.info("Could not load BS product variant", productVariant, {
      structuredData: true,
    });
    return [];
  } else {
    return productVariant.products[0];
  }
};


