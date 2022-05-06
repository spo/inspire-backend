/* eslint-disable max-len */
const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../config");

exports.createProduct = functions.https.onRequest(async (req, res) => {
  const mutation = gql`
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      bodyHtml: "test bodyHtml",
      descriptionHtml: "test descriptionHtml",
      options: [
        "ml",
      ],
      productType: "",
      status: "DRAFT",
      title: "Test Title",
      variants: [
        {
          barcode: "test barcode 1234",
          inventoryItem: {
            cost: "5",
            tracked: true,
          },
          inventoryManagement: "FULFILLMENT_SERVICE",
          inventoryPolicy: "DENY",
          inventoryQuantities: {
            availableQuantity: 5,
            locationId: config.shopify.location.fuersten.id,
          },
          options: [
            "25",
          ],
          position: 1,
          price: "24.95",
          requiresShipping: true,
          sku: "p-3847-7892",
          taxCode: "19",
          taxable: true,
          title: "test title variante",
          weight: 0.6,
          weightUnit: "KILOGRAMS",
        },
      ],
      vendor: "Vendor Hersteller Test",
    },
  };

  try {
    const data = await request(config.shopify.endpoint, mutation, variables);
    res.send(data);
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
