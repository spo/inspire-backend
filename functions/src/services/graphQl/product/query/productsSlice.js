const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Load all products in slices. Limit: 100 variants!
 * @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product slice objects
 */
exports.productsSlice = async (cursor) => {
  const productsSlice = gql`
    query ($numProducts: Int!, $cursor: String, $metafieldKey: String!, $metafieldNamespace: String!) {
      products(first: $numProducts, after: $cursor) {
        nodes {
          id
          title
          totalInventory
          totalVariants
          privateMetafield(key: $metafieldKey, namespace: $metafieldNamespace) {
            value
            valueType
          }
          variants(first: 100) {
            nodes {
              id
              displayName
              barcode
              image {
                id
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }  
      `;

  const variables = {
    numProducts: 1,
    cursor: cursor,
    metafieldKey: shopify.privateMetafields.product.initialised,
    metafieldNamespace: shopify.privateMetafields.product.namespace,
  };

  try {
    const productSlice = await request(shopify.endpoint, productsSlice, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
