const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../../config/config");
const {privateMetafields, metafields} = require("./productCreateConfig");
const {convertUnitOfMeasurement} = require("../../../../../utils/convertUnitOfMeasurement");
const {calculateInitialSellingPrice} = require("../../../../../utils/calculateInitialSellingPrice");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");


/**
 * Create product
 * @param {object} product The Bs product
 * @return {object} The new created product
*/
exports.productCreateBs = async (product) => {
  const mutationProductCreateBs = gql`
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
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
      status: "DRAFT",
      title: product.description,
      vendor: product.brand,
      options: [
        convertUnitOfMeasurement(product.weight_UnitOfMeasurement),
      ],
      variants: [
        {
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
          options: [
            convertNumberToStringWithComma(product.weight),
          ],
          price: calculateInitialSellingPrice(product.price),
          requiresShipping: true,
          taxable: true,
          weight: product.weight,
          weightUnit: "GRAMS",
          metafields: resultMetafields,
          privateMetafields: resultPrivateMetafields,
        },
      ],
    },
  };

  try {
    const data = await request(shopify.endpoint, mutationProductCreateBs, variables);

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

