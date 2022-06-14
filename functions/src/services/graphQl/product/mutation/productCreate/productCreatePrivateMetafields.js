const functions = require("firebase-functions");
const {shopify} = require("../../../../../config/config");
const {gql, rawRequest} = require("graphql-request");

/**
 * The metafield indicates whether the product has already been initialised or not.
* @param {string} productId The product id to be updated
 * @return {object} The updated product variant with private metafield"
 */
exports.productCreatePrivateMetafields = async (productId) => {
  try {
    const mutationProductUpdate = gql`
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
              value: "false",
              valueType: "STRING",
            },
          },
        ],
      },
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, mutationProductUpdate, variables);

    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.productUpdate.userErrors && data.productUpdate.userErrors.length > 0) {
      functions.logger.warn("Could not create private metafield initialised", productId, {
        structuredData: true,
      });
    } else {
      return {data: data.productUpdate.product, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError(error.code, error.message, error.type);
  }
};
