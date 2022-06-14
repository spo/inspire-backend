const fetch = require("node-fetch");
const functions = require("firebase-functions");
require("dotenv").config();

/**
 * Get google shopping data like images, titles, descriptions.
 * @param {*} productId
 * @param {*} ean
 * @return {object} google shopping data
 */
exports.getGoogleShoppingData = async function(productId, ean) {
  const {SERPAPI_API_KEY, SERPAPI_URL, SERPAPI_GOOGLE_DOMAIN_DE, SERPAPI_LOCATION} = process.env;

  // get google product id
  const urlSearch = SERPAPI_URL;
  const paramsSearch = new URLSearchParams({
    engine: "google",
    q: ean,
    location: SERPAPI_LOCATION,
    google_domain: SERPAPI_GOOGLE_DOMAIN_DE,
    gl: "de",
    hl: "de",
    tbm: "shop",
    api_key: SERPAPI_API_KEY,
  });

  const responseProductId = await fetch(urlSearch + paramsSearch);
  const dataProductId = await responseProductId.json();

  if (dataProductId && dataProductId.error) {
    functions.logger.info("Could not load google shopping data for product id:", productId, dataProductId, {
      structuredData: true,
    });
    return dataProductId;
  } else {
    // get google product data
    const productId = dataProductId.shopping_results[0].product_id;

    const urlProduct = SERPAPI_URL;
    const paramsProduct = new URLSearchParams({
      engine: "google_product",
      google_domain: SERPAPI_GOOGLE_DOMAIN_DE,
      product_id: productId,
      location: SERPAPI_LOCATION,
      gl: "de",
      hl: "de",
      api_key: SERPAPI_API_KEY,
    });

    const responseProduct = await fetch(urlProduct + paramsProduct);
    const dataProduct = await responseProduct.json();
    return dataProduct;
  }
};


