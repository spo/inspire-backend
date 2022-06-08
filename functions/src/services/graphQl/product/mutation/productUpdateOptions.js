// TODO: Shopify Client überall verwenden

const functions = require("firebase-functions");
const {Shopify} = require("@shopify/shopify-api");

/**
 * Extend products options
* @param {string} productId The product id
* @param {object} keys The product option keys
* @param {object} variants The product variants with option values
* @param {object} barcode Barcode which will be added as a new option
* @return {object} The updated product variant with new option"
*/
exports.productUpdateOptions = async (productId, keys, variants, barcode) => {
  try {
    if (!keys) {
      throw new functions.https.HttpsError("No options available");
    }

    const optionsKeys = [];
    const optionsValues = [];
    const values = [];

    // Get key options
    for (let index = 0; index < keys.length; index++) {
      const option = keys[index];
      optionsKeys.push(option.name);
    }

    // Add new unique options so that the same variants can be distinguished and created
    optionsKeys.push("Version");

    // Get value options
    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      for (let index = 0; index < variant.node.selectedOptions.length; index++) {
        const value = variant.node.selectedOptions[index].value;
        values.push(value);
      }
      values.push(barcode);

      optionsValues.push({options: values});
    }

    const client = new Shopify.Clients.Graphql(Shopify.Context.HOST_NAME, Shopify.Context.API_SECRET_KEY);
    const request = await client.query({
      data: {
        query: `mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          input: {
            id: productId,
            options: optionsKeys,
            variants: optionsValues,
          },
        },
      },
    });

    if (request.body.data.productUpdate.userErrors.length > 0) {
      throw new functions.https.HttpsError("internal", productId, request.body.data.productUpdate.userErrors);
    }

    return {data: request.body.data.productUpdate.product, extensions: request.body.extensions};
  } catch (error) {
    throw new functions.https.HttpsError(error.code, error.message, error.type);
  }
};
