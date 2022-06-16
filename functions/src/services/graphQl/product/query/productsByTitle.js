const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product by title
 * @param {string} title The product title
 * @return {object} The products
 */
exports.productsByTitle = async (title) => {
  try {
    const queryProducts = gql `
      query ($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          nodes {
            id
            title
          }
        }
      }`;

    const variables = {
      first: 10,
      query: `title:'${title}'`,
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, queryProducts, variables);

    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.products.userErrors && data.products.userErrors.length > 0) {
      functions.logger.warn("Could not query product variant by title", title, data.products.userErrors, {
        structuredData: true,
      });
    } else {
      return {data: data.products.nodes, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
