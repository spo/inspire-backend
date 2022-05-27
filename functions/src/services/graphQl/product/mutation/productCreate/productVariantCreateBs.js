const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../../config/config");
const {privateMetafields, metafields} = require("./productCreateConfig");
const {calculateInitialSellingPrice} = require("../../../../../utils/calculateInitialSellingPrice");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");


/**
 * Create product variant
 * @param {object} product The Bs product
 * @param {object} productId The id of the product to which the product variant is to be added
 * @return {object} The new created product
*/
exports.productVariantCreateBs = async (product, productId) => {
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

  const resultPrivateMetafields = privateMetafields(product);
  const resultMetafields = metafields(product);

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
      privateMetafields: resultPrivateMetafields,
      options: [
        convertNumberToStringWithComma(product.weight),
      ],
    },
  };

  try {
    const data = await request(shopify.endpoint, productVariantCreate, variables);

    if (data.productCreate.userErrors.length > 0) {
      functions.logger.info("Could not create Variant", product.articleNumber, product.description, data.productCreate.userErrors, {
        structuredData: true,
      });
    } else {
      return data.productCreate.product;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code, product.articleNumber, product.description);
  }
};
