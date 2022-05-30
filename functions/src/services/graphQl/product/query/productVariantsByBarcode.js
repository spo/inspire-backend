const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product variants by barcode
 * @param {string} barcode The product variant barcode
 * @return {object} Product variants object
 */
exports.productVariantsByBarcode = async (barcode) => {
  const productVariantsByBarcode = gql`
    query ($first: Int!, $query: String) {
      productVariants(first: $first, query: $query) {
        edges {
          node {
            id
            displayName
            barcode
          }
        }
      }
    }
      `;

  const variables = {
    first: 1,
    query: `barcode:${barcode}`,
  };

  try {
    const {data, extensions} = await rawRequest(shopify.endpoint, productVariantsByBarcode, variables);
    return {data, extensions};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
