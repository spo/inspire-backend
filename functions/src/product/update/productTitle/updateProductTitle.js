const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../../../config");
const {mutationProductUpdate} = require("../mutationProductUpdate");

/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {object} googleShoppingData Google Shopping product information
 * @return {object} The product object
 */
exports.updateProductTitle = async (product, googleShoppingData) => {
  // Skip variants without privateMetafield
  if (!product.privateMetafield) {
    functions.logger.warn("Product title could not be updated because no privateMetafield exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants without privateMetafield value
  if (!product.privateMetafield.value) {
    functions.logger.warn("Product title could not be updated because no privateMetafield with value exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants that already has been initialised
  if (product.privateMetafield.value === "true") {
    functions.logger.warn("Product title has already been initialised", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const {title, error} = googleShoppingData.product_results;

  // Skip if no google shopping data
  if (error) {
    functions.logger.warn("No google shopping information for", product.id, product.title, error, {
      structuredData: true,
    });
    return;
  }

  const resultProductUpdate = await mutationProductUpdate(product.id, title, "");

  functions.logger.info("Updated product title for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
    structuredData: true,
  });

  await mutationProductUpdateTitleInizialised(product.id, "true");

  return resultProductUpdate;
};

/**
 * Update title inizialised status. Is the title inizialised true, the title will not longer override by for example google shopping
 * @param {string} productId The product id to be updated
 * @param {string} value The privateMetafields value
*/
const mutationProductUpdateTitleInizialised = async (productId, value) => {
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
  }
    `;

  const variables = {
    input: {
      id: productId,
      privateMetafields: [
        {
          key: "title_inizialised",
          namespace: "title",
          valueInput: {
            value,
            valueType: "STRING",
          },
        },
      ],
    },
  };


  try {
    const data = await request(config.shopify.endpoint, mutationProductUpdate, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

