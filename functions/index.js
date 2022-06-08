const {bulkUpdateProducts} = require("./src/api/bulkUpdateProducts");
const {bulkImportProducts} = require("./src/api/bulkImportProducts");
const {Shopify, ApiVersion} = require("@shopify/shopify-api");
require("dotenv").config();

const {API_KEY_SHOPIFY, HOST_SHOPIFY, API_SECRET_KEY_SHOPIFY, SCOPES_SHOPIFY} = process.env;

// functions
exports.bulkImportProducts = bulkImportProducts;
exports.bulkUpdateProducts = bulkUpdateProducts;

Shopify.Context.initialize({
  API_KEY: API_KEY_SHOPIFY,
  API_SECRET_KEY: API_SECRET_KEY_SHOPIFY,
  SCOPES: [SCOPES_SHOPIFY],
  HOST_NAME: HOST_SHOPIFY,
  API_VERSION: ApiVersion.April22,
});
