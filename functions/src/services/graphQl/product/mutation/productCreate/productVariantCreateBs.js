const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../../config/config");
const {metafields} = require("./productCreateConfig");
const {calculateInitialSellingPrice} = require("../../../../../utils/calculateInitialSellingPrice");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");
const {checkColor} = require("../../../../../utils/color/checkColor");
const {checkSelection} = require("../../../../../utils/selection/checkSelection");

/**
 * Create product variant
 * @param {object} product The Bs product
 * @param {object} productId The id of the product to which the product variant is to be added
 * @return {object} The new created product variant
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
          resultOptionValueColor, resultOptionValueSelection, resultOptionValueWeight, // keep order in sync with productCreateBs
        ],
      },
    };

    const data = await request(shopify.endpoint, productVariantCreate, variables);

    if (data.productVariantCreate.userErrors.length > 0) {
      const errors = data.productVariantCreate.userErrors;

      for (let index = 0; index < errors.length; index++) {
        const error = errors[index];

        functions.logger.info(error.message, product.title, product.barcode, {
          structuredData: true,
        });
      }
    } else {
      return data.productVariantCreate.productVariant;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code, product.articleNumber, product.description);
  }
};
