const functions = require("firebase-functions");
const {importProductVariant} = require("../services/product/importProductsService");
const {getBsProducts} = require("../services/common/getBsProducts");
const {productVariantsByBarcode} = require("../services/graphQl/product/query/productVariantsByBarcode");
const {apiWait} = require("../utils/apiWait");
const {wait} = require("../utils/wait");

exports.importProducts = async (slice = {from: 0}) => {
  try {
    const productsToImport = await getBsProducts();
    const result = await startImport(productsToImport.slice(slice.from, slice.to));
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Create new product variants they not exist
 * @param {Array} productVariantsToImport Product variants to be imported
 * @return {Promise<array>} List with all impoted product variants
 */
const startImport = async (productVariantsToImport) => {
  try {
    const importedProductVariantsList = [];

    // Loop over all product variants to be import
    for (let index = 0; index < productVariantsToImport.length; index++) {
      const productVariantToImport = productVariantsToImport[index];

      if (!productVariantToImport) {
        functions.logger.info("The product variant to be imported is not defined", index, {
          structuredData: true,
        });
        continue;
      }

      if (!productVariantToImport.barcode) {
        functions.logger.info("The product variant to be importied does not have a barcode", productVariantToImport.articleNumber, productVariantToImport.description, {
          structuredData: true,
        });
        continue;
      }

      const existingProduct = await productVariantsByBarcode(productVariantToImport.barcode);

      if (existingProduct && existingProduct.extensions) {
        await apiWait(existingProduct.extensions);
      }

      // Skip variants with existing barcode
      if (existingProduct.data.length > 0) {
        functions.logger.info("Product variant with barcode already exists", productVariantToImport.articleNumber, productVariantToImport.description, productVariantToImport.barcode, {
          structuredData: true,
        });
        continue;
      }

      const importedProductVariants = await importProductVariant(productVariantToImport, productVariantsToImport);
      importedProductVariantsList.push(importedProductVariants);


      const nextProductVariant = productVariantsToImport[index+1];
      await nextWait(nextProductVariant, productVariantToImport);
    }

    return importedProductVariantsList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Check if next product variant has the same description as the current one.
 * If yes, wait 20 seconds so that shopify has enough time to initialize tags.
 * @param {object} nextProductVariant The bs product variant to be imported
 * @param {object} currentProductVariant The bs product variant to be imported
 */
async function nextWait(nextProductVariant, currentProductVariant) {
  if (nextProductVariant) {
    if (nextProductVariant.description === currentProductVariant.description) {
      return await wait(20000); // wait until shopify has product tag initialized
    }
  }
}
