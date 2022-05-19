const functions = require("firebase-functions");
const {productUpdate} = require("../graphQl/product/mutation/productUpdate");
const {productUpdateTitleInizialised} = require("../graphQl/product/mutation/productUpdateTitleInizialised");

/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {string} title Title to be updated
 * @return {object} The product object
 */
exports.updateProductTitle = async (product, title) => {
  // Skip if no title provided
  if (title === "") {
    functions.logger.warn("An empty title cannot be updated", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants without privateMetafield
  if (!product.privateMetafield) {
    functions.logger.warn("Product title could not be updated because no privateMetafield exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants without privateMetafield value
  if (!product.privateMetafield.value) {
    functions.logger.warn("Product title could not be updated because no privateMetafield with value exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants that already has been initialised
  if (product.privateMetafield.value === "true") {
    functions.logger.warn("Product title has already been initialised", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const resultProductUpdate = await productUpdate(product.id, title, "");

  if (resultProductUpdate.productUpdate) {
    functions.logger.info("Updated product title for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
      structuredData: true,
    });
    await productUpdateTitleInizialised(product.id, "true");
  }

  return resultProductUpdate;
};
