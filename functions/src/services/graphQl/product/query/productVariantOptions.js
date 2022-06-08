const functions = require("firebase-functions");
const {Shopify} = require("@shopify/shopify-api");

/**
* Query product variants options
* @param {string} productId The product id
* @return {object} The product varaints options including name and value
*/
exports.productVariantOptions = async (productId) => {
  try {
    const client = new Shopify.Clients.Graphql(Shopify.Context.HOST_NAME, Shopify.Context.API_SECRET_KEY);
    const request = await client.query({
      data: {
        query: `query product($id: ID!) {
          product(id: $id) {
            id
            options {
              name
            }
            variants(first: 100) { 
              edges {
                node {
                  selectedOptions {
                    value
                  }
                }
              }
            }
          }
        }`,
        variables: {
          id: productId,
        },
      },
    });

    if (request.body.data.product.userErrors && request.body.data.product.userErrors.length > 0) {
      throw new functions.https.HttpsError("internal", productId, request.body.data.product.userErrors);
    }

    return {data: request.body.data.product};
  } catch (error) {
    throw new functions.https.HttpsError(error.code, error.message, error.type);
  }
};
