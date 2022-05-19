const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../../config/config");

/**
 * Load all products in slices. Limit: 100 variants!
 * @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product slice objects
 */
exports.productsSlice = async (cursor) => {
  const productsSlice = gql`
    query ($numProducts: Int!, $cursor: String) {
      products(first: $numProducts, after: $cursor) {
        nodes {
          id
          title
          totalInventory
          totalVariants
          privateMetafield(key: "title_inizialised", namespace: "title") {
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
    numProducts: 3,
    cursor: cursor,
  };

  try {
    const productSlice = await request(config.shopify.endpoint, productsSlice, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};
