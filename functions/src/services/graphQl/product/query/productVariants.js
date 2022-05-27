const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product variants
* @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product variants with private metafields "product_bs_description"
 */
exports.productVariants = async (cursor) => {
  const productVariants = gql`
    query ($namespace: String!, $key: String!, $numProducts: Int!, $cursor: String) {
      productVariants(first: $numProducts, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          barcode
          displayName
          privateMetafield(namespace: $namespace, key: $key) {
            id
            value
          }
          product {
            id
          }
        }
      }
    }
      `;

  const variables = {
    namespace: shopify.privateMetafields.product.namespace,
    key: shopify.privateMetafields.product.bsDescription.key,
    numProducts: 3,
    cursor,
  };

  try {
    const productSlice = await request(shopify.endpoint, productVariants, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.code, error.type);
  }
};
