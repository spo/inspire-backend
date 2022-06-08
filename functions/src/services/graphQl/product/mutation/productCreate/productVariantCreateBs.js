const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../../config/config");
const {metafields} = require("./productCreateConfig");
const {calculateInitialSellingPrice} = require("../../../../../utils/calculateInitialSellingPrice");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");
const {checkColor} = require("../../../../../utils/color/checkColor");
const {checkSelection} = require("../../../../../utils/selection/checkSelection");
const {productVariantOptions} = require("../../query/productVariantOptions");
const {productUpdateOptions} = require("../../mutation/productUpdateOptions");


/**
 * Create product variant
 * @param {object} product The Bs product
 * @param {object} productId The id of the product to which the product variant is to be added
 * @return {object} The new created product
*/
exports.productVariantCreateBs = async (product, productId) => {
  try {
    const productVariantCreate = gql`
    mutation productVariantCreate($input: ProductVariantInput!) {
      productVariantCreate(input: $input) {
        product {
          id
          title
        }
        productVariant {
          id
          displayName
        }
        userErrors {
          field
          message
        }
      }
    }
      `;

    const resultMetafields = metafields(product);
    const resultOptionValueWeight = convertNumberToStringWithComma(product.weight);
    const resultOptionValueColor = checkColor(product.color);
    const resultOptionValueSelection = checkSelection(product.additionalProductInformation);

    const variables = {
      input: {
        productId: productId,
        barcode: product.barcode,
        inventoryItem: {
          cost: product.price,
          tracked: true,
        },
        inventoryManagement: "FULFILLMENT_SERVICE",
        inventoryPolicy: "DENY",
        inventoryQuantities: {
          availableQuantity: product.availableStock,
          locationId: shopify.location.BSI.id,
        },
        price: calculateInitialSellingPrice(product.price),
        requiresShipping: true,
        taxable: true,
        weight: product.weight,
        weightUnit: "GRAMS",
        metafields: resultMetafields,
        options: [
          resultOptionValueColor, resultOptionValueSelection, resultOptionValueWeight,
        ],
      },
    };


    const data = await request(shopify.endpoint, productVariantCreate, variables);


    if (data.productVariantCreate.userErrors.length > 0) {
      const errors = data.productVariantCreate.userErrors;

      for (let index = 0; index < errors.length; index++) {
        const error = errors[index];

        // if variant with same options already exists -> extend options for existing product
        if (error.message.includes("already exists. Please change at least one option value.")) {
          const resultProductVariantOptions = await productVariantOptions(productId);
          const resultProductUpdateOptions = await productUpdateOptions(
              resultProductVariantOptions.data.id,
              resultProductVariantOptions.data.options,
              resultProductVariantOptions.data.variants.edges,
              product.barcode);

          functions.logger.info("Extend product options", resultProductUpdateOptions.id, resultProductUpdateOptions.title, {
            structuredData: true,
          });
        } else {
          functions.logger.warn("Could not create variant", product.articleNumber, product.description, data.productVariantCreate.product.title, data.productVariantCreate.userErrors, {
            structuredData: true,
          });
        }
      }
    } else {
      return data.productVariantCreate.productVariant;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code, product.articleNumber, product.description);
  }
};
