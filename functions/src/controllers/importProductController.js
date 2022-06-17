const functions = require("firebase-functions");
const {importProductVariant} = require("../services/product/importProductsService");
const {getBsProductByArticleNumber} = require("../services/common/getBsProductByArticleNumber");
const {productVariantsByBarcode} = require("../services/graphQl/product/query/productVariantsByBarcode");
const {apiWait} = require("../utils/apiWait");

exports.importProduct = async (articleNumber) => {
  try {
    const productVariantToImport = await getBsProductByArticleNumber(articleNumber);
    const result = await startImport(productVariantToImport);
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Create new product variant that not exist
 * @param {Array} productVariantToImport Product variant to be imported
 * @return {Promise<object>} Impoted product variant
 */
const startImport = async (productVariantToImport) => {
  try {
    if (!productVariantToImport) {
      throw new functions.https.HttpsError("not-found", "The product variant to be imported is not defined", "articleNumber-not-found");
    }

    if (!productVariantToImport.barcode) {
      throw new functions.https.HttpsError("not-found", "The product variant to be importied does not have a barcode", productVariantToImport.description, "no-barcode");
    }

    const productVariant = await productVariantsByBarcode(productVariantToImport.barcode);

    if (productVariant && productVariant.extensions) {
      await apiWait(productVariant.extensions);
    }

    // Skip variants with existing barcode
    if (productVariant.data.length > 0) {
      throw new functions.https.HttpsError("already-exists", "Product variant with barcode already exists", productVariantToImport.description, "productVariant-exists");
    }

    const importedProductVariant = await importProductVariant(productVariantToImport);

    return importedProductVariant;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};
