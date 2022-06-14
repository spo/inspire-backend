const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Update title inizialised status. Is the title inizialised true, the title will not longer override by for example google shopping
 * @param {string} productId The product id to be updated
 * @param {string} value The privateMetafields value
*/
exports.productUpdateTitleInizialised = async (productId, value) => {
  const productUpdateTitleInizialised = gql`
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
           privateMetafields(first: 10) {
            nodes {
              value
              valueType
              namespace
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`;

  const variables = {
    input: {
      id: productId,
      privateMetafields: [
        {
          key: shopify.privateMetafields.product.initialised,
          namespace: shopify.privateMetafields.product.namespace,
          valueInput: {
            value,
            valueType: "STRING",
          },
        },
      ],
    },
  };


  try {
    const data = await request(shopify.endpoint, productUpdateTitleInizialised, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};
