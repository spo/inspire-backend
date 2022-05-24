const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const {shopify} = require("../../../../config/config");
const {convertGender} = require("../../../../utils/convertGender");
const {convertUnitOfMeasurement} = require("../../../../utils/convertUnitOfMeasurement");
const {calculateInitialSellingPrice} = require("../../../../utils/calculateInitialSellingPrice");
const {checkColor} = require("../../../../utils/checkColor");

/**
 * Create product
 * @param {object} product The Bs product
 * @return {object} The new created product
*/
exports.productCreateBs = async (product) => {
  const productCreateBs = gql`
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

  const variables = {
    input: {
      status: "DRAFT",
      title: product.description,
      options: [
        convertUnitOfMeasurement(product.weight_UnitOfMeasurement),
      ],
      metafields: [
        {
          key: shopify.privateMetafields.product.bsGender.key,
          namespace: shopify.privateMetafields.product.namespace,
          type: "STRING",
          value: convertGender(product.gender),
        },
        {
          key: shopify.privateMetafields.product.bsColor.key,
          namespace: shopify.privateMetafields.product.namespace,
          type: "STRING",
          value: checkColor(product.color),
        },
        {
          key: shopify.privateMetafields.product.bsLength.key,
          namespace: shopify.privateMetafields.product.namespace,
          type: "INTEGER",
          value: product.length,
        },
        {
          key: shopify.privateMetafields.product.bsWidth.key,
          namespace: shopify.privateMetafields.product.namespace,
          type: "INTEGER",
          value: product.width,
        },
        {
          key: shopify.privateMetafields.product.bsHeight.key,
          namespace: shopify.privateMetafields.product.namespace,
          type: "INTEGER",
          value: product.height,
        },
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
            locationId: shopify.location.BSI,
          },
          options: [
            product.weight,
          ],
          price: calculateInitialSellingPrice(product.price),
          requiresShipping: true,
          taxable: true,
          weight: product.weight,
          weightUnit: "GRAMS",
          privateMetafields: [
            {
              key: shopify.privateMetafields.product.bsArticleNumber.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.articleNumber,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsConcern.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.concern,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsType.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.type,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsAssortment.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.assortment,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsSort.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.sort,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsUsedFor.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.usedFor,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsVersion.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.version,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsEdition.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.edition,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsStockType.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.stockType,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsAdditionalProductInformation.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.additionalProductInformation,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsCategory.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.category,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsDescription.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.description,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsCategoryDescription.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.categoryDescription,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsProductDescription.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.productDescription,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsProductSortDescription.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.productSortDescription,
                valueType: "STRING",
              },
            },
            {
              key: shopify.privateMetafields.product.bsExtendedDescription.key,
              namespace: shopify.privateMetafields.product.namespace,
              valueInput: {
                value: product.extendedDescription,
                valueType: "STRING",
              },
            },
          ],
        },
      ],
      vendor: product.brand,
    },

  };

  try {
    console.log("variables:");
    console.log(variables);
    const data = await request(shopify.endpoint, productCreateBs, variables);
    console.log("data: ", data);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

