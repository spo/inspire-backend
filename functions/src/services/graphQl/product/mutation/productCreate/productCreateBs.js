const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../../config/config");
const {metafields} = require("./productCreateConfig");
const {convertUnitOfMeasurement} = require("../../../../../utils/convertUnitOfMeasurement");
const {calculateInitialSellingPrice} = require("../../../../../utils/calculateInitialSellingPrice");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");
const {checkColorOption} = require("../../../../../utils/color/checkColorOption");
const {checkColor} = require("../../../../../utils/color/checkColor");
const {checkSelectionOption} = require("../../../../../utils/selection/checkSelectionOption");
const {checkSelection} = require("../../../../../utils/selection/checkSelection");

/**
 * Create product
 * @param {object} product The bs product
 * @return {object} The new created product
*/
exports.productCreateBs = async (product) => {
  const mutationProductCreateBs = gql`
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          variants(first: 1) {
            nodes {
              id
              barcode
              displayName
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

  const resultMetafields = metafields(product);
  const resultOptionWeight = convertUnitOfMeasurement(product.weight_UnitOfMeasurement);
  const resultOptionValueWeight = convertNumberToStringWithComma(product.weight);

  const resultOptionColor = checkColorOption(product.color);
  const resultOptionValueColor = checkColor(product.color);

  const resultOptionSelection = checkSelectionOption(product.additionalProductInformation);
  const resultOptionValueSelection = checkSelection(product.additionalProductInformation);

  const variables = {
    input: {
      status: "DRAFT",
      title: product.description,
      vendor: product.brand,
      options: [
        resultOptionColor, resultOptionSelection, resultOptionWeight,
      ],
      tags: [product.description],
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
            resultOptionValueColor, resultOptionValueSelection, resultOptionValueWeight,
          ],
          price: calculateInitialSellingPrice(product.price),
          requiresShipping: true,
          taxable: true,
          weight: product.weight,
          weightUnit: "GRAMS",
          metafields: resultMetafields,
        },
      ],
    },
  };

  try {
    const {data, errors, extensions} = await rawRequest(shopify.endpoint, mutationProductCreateBs, variables);
    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.productCreate.userErrors && data.productCreate.userErrors.length > 0) {
      functions.logger.warn("Could not create product", product.articleNumber, product.description, data.productCreate.userErrors, {
        structuredData: true,
      });

      return;
    } else {
      functions.logger.info("Product created", data.productCreate.product.id, data.productCreate.product.title, {
        structuredData: true,
      });

      return {data: data.productCreate.product, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code, product.articleNumber, product.description);
  }
};

