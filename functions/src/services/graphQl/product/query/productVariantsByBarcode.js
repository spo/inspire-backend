const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product variants by barcode
 * @param {string} barcode The product variant barcode
 * @return {object} Product variants object
 */
exports.productVariantsByBarcode = async (barcode) => {
  try {
    const queryProductVariants = gql `
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
    }`;

    const variables = {
      first: 1,
      query: `barcode:${barcode}`,
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, queryProductVariants, variables);

    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.productVariants.userErrors && data.productVariants.userErrors.length > 0) {
      functions.logger.warn("Could not query product variant by barcode", barcode, data.productVariants.userErrors, {
        structuredData: true,
      });
    } else {
      return {data: data.productVariants.edges, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
