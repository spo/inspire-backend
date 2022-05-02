const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest(async (request, response) => {
  // get google product id
  const url = "https://serpapi.com/search?";

  const params = new URLSearchParams({
    engine: "google",
    q: "3614228220903",
    location: "Germany",
    google_domain: "google.de",
    gl: "de",
    hl: "de",
    tbm: "shop",
    api_key: "dedc7e9920b560f037837346cee499b06275010ef714c0a71ddf2097d31e790c",
  });

  functions.logger.info("url", url + params, {
    structuredData: true,
  });

  const responseProductId = await fetch(url + params);
  const dataProductId = await responseProductId.json();

  // get google product data
  const productId = dataProductId.shopping_results[0].product_id;

  functions.logger.info("productId", productId, {
    structuredData: true,
  });

  // functions.logger.info("Hello logs!", {structuredData: true});
  response.send(dataProductId);
});
