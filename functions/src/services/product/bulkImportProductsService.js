const {getBsProducts} = require("../common/getBsData");
const functions = require("firebase-functions");
const {productVariantsByBarcode} = require("../../services/graphQl/product/query/productVariantsByBarcode");
const {productVariants} = require("../../services/graphQl/product/query/productVariants");
const {productCreateBs} = require("../../services/graphQl/product/mutation/productCreateBs");

// 1) Produkt aus Liste nehmen
// 2 Prüfen ob Produkt schon vorhanden
// 2.1 Wenn vorhanden mit Barcode dann nicht anlegen
// 2.2 Wenn nicht vorhanden jedoch mit gleicher description dann als Variante anlegen
// 2.3 Wenn nicht vorhanden und auch nicht mit gleicher description dann als neues Produkt anlegen

// 2) mit diesem Produkt komplette Liste durch suchen ob noch weitere Varianten vorhanden sind
// 3) Wenn nein dann produkt anlegen
// 4) Wenn ja dann Produkt mit allen Varianten anlegen

exports.bulkImportProducts = async () => {
  try {
    const products = await getBsProducts();
    const result = await getVariants(products);
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Add description to product variant
 * @param {Array} productsToImport List of products
 * @param {string} description Product description
 * @return {Array} List with all variants
 */
const getVariants = async (productsToImport) => {
  try {
    const productList = [];
    let hasMoreProductsToLoad = true;
    let cursor = null;

    // Loop over all products to be import
    for (let index = 0; index < productsToImport.length; index++) {
      const productToImport = productsToImport[index];

      if (!productToImport) {
        functions.logger.warn("The product to be imported is not defined", index, {
          structuredData: true,
        });
        continue;
      }

      if (!productToImport.barcode) {
        functions.logger.warn("The product to be importied does not have a barcode", productToImport.articleNumber, productToImport.description, {
          structuredData: true,
        });
        continue;
      }

      const existingProduct = await productVariantsByBarcode(productToImport.barcode);

      // Skip variants with no bs description
      if (existingProduct.productVariants.edges.length > 0) {
        functions.logger.warn("Variant already exists", productToImport.id, productToImport.title, productToImport.barcode, {
          structuredData: true,
        });
        continue;
      }

      // Loop over all existing product variants. The product variants are loaded with paggination.
      while (hasMoreProductsToLoad) {
        const existingProductVariants = await productVariants(cursor);
        hasMoreProductsToLoad = existingProductVariants.hasNextPage;
        cursor = existingProductVariants.endCursor;


        existingProductVariants.productVariants.nodes.map( async (variant) => {
          if (!variant.privateMetafield) {
            functions.logger.info("No BS description", variant.id, variant.displayName, {
              structuredData: true,
            });
          }
          const newProduct = await productCreateBs(productToImport);
          console.log("productCreated", newProduct);
          productList.push(newProduct);
        });
      }
    }

    return productList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};
