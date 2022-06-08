// TODO: Shopify Client überall verwenden

const functions = require("firebase-functions");
const {shopify} = require("../../../../config/config");
const {Shopify} = require("@shopify/shopify-api");

/**
 * Get product variants
* @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product variants with private metafields "product_bs_description"
 */
exports.productVariants = async (cursor) => {
  try {
    const client = new Shopify.Clients.Graphql(Shopify.Context.HOST_NAME, Shopify.Context.API_SECRET_KEY);
    const request = await client.query({
      data: {
        query: `query ($namespace: String!, $key: String!, $numProducts: Int!, $cursor: String) {
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
        }`,
        variables: {
          namespace: shopify.privateMetafields.product.namespace,
          key: shopify.privateMetafields.product.bsDescription.key,
          numProducts: 10,
          cursor,
        },
      },
    });

    return {data: request.body.data, extensions: request.body.extensions};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.code, error.type);
  }
};
