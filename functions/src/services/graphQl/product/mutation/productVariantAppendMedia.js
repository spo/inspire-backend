const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../../config/config");

/**
 * Attach media to product variant
 * @param {string} productId The product id
 * @param {string} variantId The variant id
 * @param {string} mediaId The media id
*/
exports.productVariantAppendMedia = async (productId, variantId, mediaId) => {
  const productVariantAppendMedia = gql`
    mutation ($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
      productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
        product {
          id
          title
        }
        userErrors {
          code
          field
          message
        }
      }
    }
      `;

  const variables = {
    productId,
    variantMedia: [
      {
        variantId,
        mediaIds: [mediaId],
      },
    ],
  };

  try {
    const data = await request(config.shopify.endpoint, productVariantAppendMedia, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

