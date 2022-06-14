const functions = require("firebase-functions");
const {privateMetafields} = require("./productCreateConfig");
const {shopify} = require("../../../../../config/config");
const {gql, rawRequest} = require("graphql-request");

/**
 * Add private metafield for product variant
* @param {string} productVariantId The product variant id
* @param {object} product The product variant id
 * @return {object} The updated product variant with private metafield"
 */
exports.productVariantCreatePrivateMetafields = async (productVariantId, product) => {
  try {
    const resultPrivateMetafields = privateMetafields(product);

    const mutationProductVariantUpdate = gql`mutation productVariantUpdate($input: ProductVariantInput!) {
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
    }`;

    const variables = {
      input: {
        id: productVariantId,
        privateMetafields: resultPrivateMetafields,
      },
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, mutationProductVariantUpdate, variables);

    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.productVariantUpdate.userErrors && data.productVariantUpdate.userErrors.length > 0) {
      functions.logger.warn("Could not create private metafields", product.description, product.barcode, data.productVariantUpdate.userErrors, {
        structuredData: true,
      });
    } else {
      return {data: data.productVariantUpdate, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError(error.code, error.message, error.type);
  }
};
