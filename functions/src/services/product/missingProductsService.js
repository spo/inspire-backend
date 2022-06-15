const functions = require("firebase-functions");
const {getBsProducts} = require("../common/getBsProducts");
const {productVariantsByBarcode} = require("../graphQl/product/query/productVariantsByBarcode");
const {apiWait} = require("../../utils/apiWait");

/**
   * Starts the process
   * @param {object} slice Indicates the data range
   * @return {Promise<array>} List with all missing product variants
   */
exports.missingProducts = async (slice = {from: 0}) => {
  try {
    const bsProducts = await getBsProducts();
    const result = await checkMissingProduct(bsProducts.slice(slice.from, slice.to));
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Check which product variants of BS are missing
 * @param {Array} bsProducts All BS products
 * @return {Promise<array>} List with all missing product variants
 */
const checkMissingProduct = async (bsProducts) => {
  try {
    const missingProducts = [];

    // Loop over all BS product variants
    for (let index = 0; index < bsProducts.length; index++) {
      const bsProduct = bsProducts[index];

      if (!bsProduct) {
        functions.logger.info("The BS product variant is not defined", index, {
          structuredData: true,
        });
        continue;
      }

      if (!bsProduct.barcode) {
        functions.logger.info("The BS product variant does not have a barcode", bsProduct.articleNumber, bsProduct.description, {
          structuredData: true,
        });
        continue;
      }

      const existingProduct = await productVariantsByBarcode(bsProduct.barcode);

      if (existingProduct && existingProduct.extensions) {
        await apiWait(existingProduct.extensions);
      }

      // Add missing product variants to array
      if (existingProduct.data.length <= 0) {
        missingProducts.push({
          barcode: bsProduct.barcode,
          title: bsProduct.description,
          articleNumber: bsProduct.articleNumber,
        });
      }
    }

    return missingProducts;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};
