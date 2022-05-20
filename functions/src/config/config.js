require("dotenv").config();

const {
  API_KEY_SHOPIFY,
  API_SECRET_KEY_SHOPIFY,
  HOST_SHOPIFY,
  API_VERSION_SHOPIFY} = process.env;

// TODO: remove location
// TODO: use shopify node lib
module.exports = {
  shopify: {
    endpoint: `https://${API_KEY_SHOPIFY}:${API_SECRET_KEY_SHOPIFY}@${HOST_SHOPIFY}/admin/api/${API_VERSION_SHOPIFY}/graphql.json`,
    location: {
      fuersten: {id: "gid://shopify/Location/66785018045"},
    },
  },
};
