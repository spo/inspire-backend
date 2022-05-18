const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../config/config");

/**
 * Get product description by id
 * @param {string} productId The product id
 * @return {object} Product object with description
 */
exports.queryProductDescription = async (productId) => {
  const queryProductDescription = gql`
    query($id: ID!) {
      product(id: $id) {
        bodyHtml
      }
    }
      `;

  const variables = {
    id: productId,
  };

  try {
    const productSlice = await request(config.shopify.endpoint, queryProductDescription, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
