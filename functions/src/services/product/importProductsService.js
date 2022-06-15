const {getBsProducts} = require("../common/getBsProducts");
const functions = require("firebase-functions");
const {productVariantsByBarcode} = require("../../services/graphQl/product/query/productVariantsByBarcode");
const {productVariants} = require("../../services/graphQl/product/query/productVariants");
const {productCreateBs} = require("../graphQl/product/mutation/productCreate/productCreateBs");
const {productVariantCreateBs} = require("../graphQl/product/mutation/productCreate/productVariantCreateBs");
const {productVariantCreatePrivateMetafields} = require("../graphQl/product/mutation/productCreate/productVariantCreatePrivateMetafields");
const {productCreatePrivateMetafields} = require("../graphQl/product/mutation/productCreate/productCreatePrivateMetafields");
const {apiWait} = require("../../utils/apiWait");

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
 * Create new product variants that do not yet exist
 * @param {Array} productsToImport Product variants to be imported
 * @return {Array} List with all impoted product variants
 */
const startImport = async (productsToImport) => {
  try {
    const importedProducts = [];

    // Loop over all product variants to be import
    for (let index = 0; index < productsToImport.length; index++) {
      const productVariantToImport = productsToImport[index];

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

      const importedProductVariants = await importProductVariant(productVariantToImport);
      importedProducts.push(importedProductVariants);
    }

    return importedProducts;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Create new product variants
 * @param {Array} productVariantToImport
 */
async function importProductVariant(productVariantToImport) {
  try {
    const allProductVariants = await getAllProductVariants();

    // if no product variants exist create new product
    if (allProductVariants.length == 0) {
      const product = await createProductWithPrivateMetafields(productVariantToImport);
      return product;
    }

    const existingProductId = isVariantExists(allProductVariants, productVariantToImport);

    if (existingProductId === "") {
      const product = await createProductWithPrivateMetafields(productVariantToImport);
      return product;
    } else {
      const variant = await createProductVariantWithPrivateMetafields(productVariantToImport, existingProductId);
      return variant;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}


/**
 * Create product with private meta fields
 * @param {object} productVariantToImport The bs product variant to be imported
 */
async function createProductWithPrivateMetafields(productVariantToImport) {
  try {
    const newProduct = await productCreateBs(productVariantToImport);

    if (newProduct && newProduct.extensions) {
      await apiWait(newProduct.extensions);
    }

    if (newProduct && newProduct.data.variants.nodes[0].id) {
      await productVariantCreatePrivateMetafields(newProduct.data.variants.nodes[0].id, productVariantToImport);
      await productCreatePrivateMetafields(newProduct.data.id);
      return newProduct.data;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}

/**
 * Create product variant with private meta fields
 * @param {object} productVariantToImport The bs product variant to be imported
 * @param {string} productId The product id
 */
async function createProductVariantWithPrivateMetafields(productVariantToImport, productId) {
  try {
    const variant = await productVariantCreateBs(productVariantToImport, productId);

    if (variant && variant.extensions) {
      await apiWait(variant.extensions);
    }

    if (variant && variant.id) {
      await productVariantCreatePrivateMetafields(variant.id, productVariantToImport);
      return variant;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}

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
      const resultProductVariants = await productVariants(cursor, "");

      if (resultProductVariants && resultProductVariants.extensions) {
        await apiWait(resultProductVariants.extensions);
      }

      hasMoreProductsToLoad = resultProductVariants.data.pageInfo.hasNextPage;
      cursor = resultProductVariants.data.pageInfo.endCursor;
      const variants = resultProductVariants.data.nodes;

      productVariantList.push(...variants);
    }

    return productVariantList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}

/**
 * Checks whether the variant to be imported is to be created as a new product or added to an existing product.
 * @param {Array} allProductVariants All existing product variants
 * @param {object} productVariantToImport The product variant to be imported
 * @return {string} The product id
 */
function isVariantExists(allProductVariants, productVariantToImport) {
  let existingProductId = "";

  // Loop over existing products
  for (let index = 0; index < allProductVariants.length; index++) {
    const existingProductVariant = allProductVariants[index];

    if (!existingProductVariant.privateMetafield) {
      functions.logger.warn("No bs description available as private metafield", existingProductVariant.id, existingProductVariant.displayName, {
        structuredData: true,
      });
      continue;
    }

    // If a product with an associated variant already exists, add the new variant to the product.
    // If not create a new standalone product
    if (existingProductVariant.privateMetafield.value === productVariantToImport.description) {
      existingProductId = existingProductVariant.product.id;
      return existingProductId;
    }
  }
  return existingProductId;
}

