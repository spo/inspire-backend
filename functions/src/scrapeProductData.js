const functions = require("firebase-functions");
const fetch = require("node-fetch");

// eslint-disable-next-line max-len
exports.scrapProductData = functions.https.onRequest(async (request, response) => {
  // get google product id
  const urlSearch = "https://serpapi.com/search?";
  const paramsSearch = new URLSearchParams({
    engine: "google",
    q: "3614228220903",
    location: "Germany",
    google_domain: "google.de",
    gl: "de",
    hl: "de",
    tbm: "shop",
    api_key: "dedc7e9920b560f037837346cee499b06275010ef714c0a71ddf2097d31e790c",
  });

  const responseProductId = await fetch(urlSearch + paramsSearch);
  const dataProductId = await responseProductId.json();

  // get google product data
  const productId = dataProductId.shopping_results[0].product_id;

  const urlProduct = "https://serpapi.com/search?";
  const paramsProduct = new URLSearchParams({
    engine: "google_product",
    google_domain: "google.de",
    product_id: productId,
    location: "Germany",
    gl: "de",
    hl: "de",
    api_key: "dedc7e9920b560f037837346cee499b06275010ef714c0a71ddf2097d31e790c",
  });

  const responseProduct = await fetch(urlProduct + paramsProduct);
  const dataProduct = await responseProduct.json();

  response.send(dataProduct);
});

