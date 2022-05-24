const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../../config/config");

/**
 * Get product variants by barcode
 * @param {string} barcode The product variant barcode
 * @return {object} Product variants object
 */
exports.productVariantsByBarcode = async (barcode) => {
  const productDescription = gql`
    query ($first: Int!, $query: String) {
      productVariants(first: $first, query: $query) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
      `;

  const variables = {
    first: 100,
    query: `barcode:${barcode}`,
  };

  try {
    const productSlice = await request(config.shopify.endpoint, productDescription, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
