const {getBsProducts} = require("../common/getBsData");
const functions = require("firebase-functions");
const {productVariantsByBarcode} = require("../../services/graphQl/product/query/productVariantsByBarcode");
const {productVariants} = require("../../services/graphQl/product/query/productVariants");
const {productCreateBs} = require("../graphQl/product/mutation/productCreate/productCreateBs");
const {productVariantCreateBs} = require("../graphQl/product/mutation/productCreate/productVariantCreateBs");
const {calculateApiWaitTime} = require("../../utils/calculateApiWaitTime");
const {wait} = require("../../utils/wait");


// 1) Produkt aus Liste nehmen
// 2 Prüfen ob Produkt schon vorhanden
// 2.1 Wenn vorhanden mit Barcode dann nicht anlegen
// 2.2 Wenn nicht vorhanden jedoch mit gleicher description dann als Variante anlegen
// 2.3 Wenn nicht vorhanden und auch nicht mit gleicher description dann als neues Produkt anlegen

// 2) mit diesem Produkt komplette Liste durch suchen ob noch weitere Varianten vorhanden sind
// 3) Wenn nein dann produkt anlegen
// 4) Wenn ja dann Produkt mit allen Varianten anlegen

exports.bulkImportProducts = async (slice = {from: 0}) => {
  try {
    const importedProducts = [];
    const productsToImport = await getBsProducts();
    const result = await startImport(productsToImport.slice(slice.from, slice.to), importedProducts);
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Create new product variants that not exists already.
 * @param {Array} productsToImport List of products
 * @param {string} importedProducts Product description
 * @return {Array} List with all variants
 */
const startImport = async (productsToImport, importedProducts) => {
  try {
    // Loop over all products to be import
    for (let index = 0; index < productsToImport.length; index++) {
      const productToImport = productsToImport[index];

      if (!productToImport) {
        functions.logger.info("The product to be imported is not defined", index, {
          structuredData: true,
        });
        continue;
      }

      if (!productToImport.barcode) {
        functions.logger.info("The product to be importied does not have a barcode", productToImport.articleNumber, productToImport.description, {
          structuredData: true,
        });
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const existingProduct = await productVariantsByBarcode(productToImport.barcode);
      // await calculateApiWaitTime(existingProduct.extensions.cost);

      // Skip variants with existing barcode
      if (existingProduct.data.productVariants.edges.length > 0) {
        functions.logger.info("Variant with barcode already exists", productToImport.articleNumber, productToImport.description, productToImport.barcode, {
          structuredData: true,
        });
        continue;
      }

      const newProduct = createProductVariant(productToImport);
      importedProducts.push(newProduct);
    }

    return importedProducts;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Returns all product variants from shopify
 */
async function getAllProductVariants() {
  try {
    const productVariantList = [];
    let hasMoreProductsToLoad = true;
    let cursor = null;

    // Loop over all existing product variants. The product variants are loaded with paggination.
    while (hasMoreProductsToLoad) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const resultProductVariants = await productVariants(cursor);
      // await calculateApiWaitTime(resultProductVariants.extensions.cost);


      hasMoreProductsToLoad = resultProductVariants.data.productVariants.pageInfo.hasNextPage;
      cursor = resultProductVariants.data.productVariants.pageInfo.endCursor;
      const variants = resultProductVariants.data.productVariants.nodes;

      productVariantList.push(...variants);
    }

    return productVariantList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}

/**
 * Create new product variants
 * @param {Array} productToImport
 */
async function createProductVariant(productToImport) {
  try {
    const allProductVariants = await getAllProductVariants();

    // Stop if no product variants available
    if (allProductVariants.length <= 0) {
      throw new functions.https.HttpsError("aborted", "No existing variants available", allProductVariants);
    }

    for (let index = 0; index < allProductVariants.length; index++) {
      const existingProductVariant = allProductVariants[index];

      if (!existingProductVariant.privateMetafield) {
        functions.logger.info("No BS description", existingProductVariant.id, existingProductVariant.displayName, {
          structuredData: true,
        });
      }

      // If a product with an associated variant already exists, add the new variant to the product.
      // If not create a new standalone variant
      if (existingProductVariant.privateMetafield === productToImport.description) {
        const newProduct = await productVariantCreateBs(productToImport, existingProductVariant.product.id);
        functions.logger.info("Product variant created", newProduct.id, newProduct.displayName, {
          structuredData: true,
        });

        return newProduct;
      } else {
        const newVariant = await productCreateBs(productToImport);
        functions.logger.info("Product created", newVariant.id, newVariant.title, {
          structuredData: true,
        });

        return newVariant;
      }
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}


