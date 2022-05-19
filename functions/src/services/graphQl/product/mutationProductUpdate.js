const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../config/config");

/**
 * Attach media to product variant
 * @param {string} productId The product id to be updated
 * @param {string} title Title to be changed
 * @param {string} description Description to be changed
*/
exports.mutationProductUpdate = async (productId, title, description) => {
  const mutationProductUpdate = gql`
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          bodyHtml
        }
        userErrors {
          field
          message
        }
      }
    }
      `;

  let variables = {};

  if (title && description) {
    variables = {
      input: {
        id: productId,
        title,
        bodyHtml: description,
      },
    };
  } else if (title) {
    variables = {
      input: {
        id: productId,
        title,
      },
    };
  } else if (description) {
    variables = {
      input: {
        id: productId,
        bodyHtml: description,
      },
    };
  }


  try {
    const data = await request(config.shopify.endpoint, mutationProductUpdate, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

