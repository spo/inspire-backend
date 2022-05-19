const functions = require("firebase-functions");
const {mutationProductUpdate} = require("../graphQl/product/mutationProductUpdate");
const {queryProductDescription} = require("../graphQl/product/queryProductDescription");

/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {object} googleShoppingData Google Shopping product information
 * @return {object} The product object
 */
exports.updateProductDescription = async (product, googleShoppingData) => {
  const resultProductDescription = await queryProductDescription(product.id);

  // Skip variants with existing description
  if (resultProductDescription.product == null) {
    functions.logger.warn("Could not load product description for", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  if (resultProductDescription.product.bodyHtml) {
    functions.logger.warn("Product already has a description", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const {description, error} = googleShoppingData.product_results;

  // Skip if no google shopping data
  if (error) {
    functions.logger.warn("No google shopping information for", product.id, product.title, error, {
      structuredData: true,
    });
    return;
  }

  const resultProductUpdate = await mutationProductUpdate(product.id, "", description);


  functions.logger.info("Updated product description for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
    structuredData: true,
  });

  return resultProductUpdate;
};

