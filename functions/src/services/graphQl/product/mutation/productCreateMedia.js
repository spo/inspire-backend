const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../../config/config");

/**
 * Add media to product
 * @param {string} originalSource The image url
 * @param {displayName} title The title is used for image alt
 * @param {string} productId The product id to attach the image to the right product
*/
exports.productCreateMedia = async (originalSource, title, productId) => {
  const productCreateMedia = gql`
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          status
          mediaContentType
          ... on MediaImage {
            id
          }
        }
        mediaUserErrors {
          code
          field
          message
        }
        product {
          id
        }
      }
    }
      `;

  const variables = {
    media: {
      alt: title,
      mediaContentType: "IMAGE",
      originalSource,
    },
    productId,
  };

  try {
    const data = await request(config.shopify.endpoint, productCreateMedia, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

