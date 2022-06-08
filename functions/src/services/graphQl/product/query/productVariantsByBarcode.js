const functions = require("firebase-functions");
const {Shopify} = require("@shopify/shopify-api");

/**
 * Get product variants by barcode
 * @param {string} barcode The product variant barcode
 * @return {object} Product variants object
 */
exports.productVariantsByBarcode = async (barcode) => {
  const client = new Shopify.Clients.Graphql(Shopify.Context.HOST_NAME, Shopify.Context.API_SECRET_KEY);
  const request = await client.query({
    data: {
      query: `query ($first: Int!, $query: String) {
        productVariants(first: $first, query: $query) {
          edges {
            node {
              id
              displayName
              barcode
            }
          }
        }
      }`,
      variables: {
        first: 1,
        query: `barcode:${barcode}`,
      },
    },
  });

  try {
    return {data: request.body.data, extensions: request.body.extensions};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
