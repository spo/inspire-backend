// TODO: Shopify Client überall verwenden

const functions = require("firebase-functions");
const {Shopify} = require("@shopify/shopify-api");
const {privateMetafields} = require("./productCreateConfig");

/**
 * Add private metafield for product variant
* @param {string} productVariantId The product variant id
* @param {object} product The product variant id
 * @return {object} The updated product variant with private metafield"
 */
exports.productCreatePrivateMetafields = async (productVariantId, product) => {
  try {
    const resultPrivateMetafields = privateMetafields(product);

    const client = new Shopify.Clients.Graphql(Shopify.Context.HOST_NAME, Shopify.Context.API_SECRET_KEY);
    const request = await client.query({
      data: {
        query: `mutation productVariantUpdate($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            product {
              id
            }
            productVariant {
              displayName
              privateMetafields(first: 30) {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          input: {
            id: productVariantId,
            privateMetafields: resultPrivateMetafields,
          },
        },
      },
    });

    if (request.body.data.productVariantUpdate.userErrors.length > 0) {
      throw new functions.https.HttpsError("internal", productVariantId, request.body.data.productVariantUpdate.userErrors);
    }


    return {data: request.body.data, extensions: request.body.extensions};
  } catch (error) {
    throw new functions.https.HttpsError(error.code, error.message, error.type);
  }
};
