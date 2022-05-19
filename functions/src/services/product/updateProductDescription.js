const functions = require("firebase-functions");
const {productUpdate} = require("../graphQl/product/mutation/productUpdate");
const {productDescription} = require("../../services/graphQl/product/query/productDescription");

// TODO: nur productId, productTitle übergeben, statt gesamtes product
/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {string} description Description to be updated
 * @return {object} The product object
 */
exports.updateProductDescription = async (product, description) => {
// Skip if no description provided
  if (description === "") {
    functions.logger.warn("An empty description cannot be updated", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const resultProductDescription = await productDescription(product.id);

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

  const resultProductUpdate = await productUpdate(product.id, "", description);


  functions.logger.info("Updated product description for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
    structuredData: true,
  });

  return resultProductUpdate;
};

