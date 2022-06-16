const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product by tag
 * @param {string} tag The product tag
 * @return {object} The product
 */
exports.productTag = async (tag) => {
  try {
    const queryProductVariants = gql `
    query ($first: Int!, $query: String) {
      products(first: $first, query: $query) {
          nodes {
            id
            title
          }
      }
    }`;

    const variables = {
      first: 1,
      query: `tag:${tag}`,
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, queryProductVariants, variables);

    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.products.userErrors && data.products.userErrors.length > 0) {
      functions.logger.warn("Could not query product variant by tag", tag, data.products.userErrors, {
        structuredData: true,
      });
    } else {
      return {data: data.products.nodes, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
