const functions = require("firebase-functions");
const getGoogleShoppingData = require("../services/common/getGoogleShoppingData");
const {updateProductTitle} = require("../services/product/updateProductTitle");
const {updateProductDescription} = require("../services/product/updateProductDescription");
const {addImageToProductVariant} = require("../services/product/bulkUpdateProductsService");
const {productsSlice} = require("../services/graphQl/product/query/productsSlice");

/**
 * Update title, description, images for all products including variants.
 * @param {number} minimumStock Minimum required stock in order to update product
 */
exports.bulkUpdateProducts = async (minimumStock) => {
  const updatedVariants = [];
  let hasMoreProductsToLoad = true;
  let cursor = null;

  try {
    // Loop over all products. The products are loaded with paggination.
    while (hasMoreProductsToLoad) {
      const result = await loopProductsSlice(updatedVariants, minimumStock, cursor);
      hasMoreProductsToLoad = result.hasNextPage;
      cursor = result.endCursor;
    }

    return updatedVariants;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};

/**
 * Loop over all products
 *
 * @param {Array} productList List contains updated variansts
 * @param {number} minimumStock Minimum required stock in order to update product
 * @param {string} cursor The cursor corresponding to the last node in edges
 */
async function loopProductsSlice(productList, minimumStock, cursor) {
  const resultProductsSlice = await productsSlice(cursor);
  const totalProducts = resultProductsSlice.products.nodes.length;
  const products = resultProductsSlice.products.nodes;
  const endCursor = resultProductsSlice.products.pageInfo.endCursor;
  const hasNextPage = resultProductsSlice.products.pageInfo.hasNextPage;

  // Stop if no products available
  if (!totalProducts > 0) {
    throw new functions.https.HttpsError("aborted", "No products available", resultProductsSlice);
  }

  // Loop over products slice
  for (let index = 0; index < totalProducts; index++) {
    const product = products[index];

    // Skip when product hat no variants
    if (!product.totalVariants > 0) {
      functions.logger.warn("No variants for product", product.id, product.title, {
        structuredData: true,
      });
      continue;
    }

    // Skip when product has no given minium stock
    if (!product.totalInventory > minimumStock) {
      functions.logger.warn("No stock for product", product.id, product.title, {
        structuredData: true,
      });
      continue;
    }

    await loopProductVariantsSlice(product, productList);
  }

  return {productList, endCursor, hasNextPage};
}

/**
 * Loop over variants slice and update variants
 * @param {object} product Product that includes variants to loop over
 * @param {Array} productList List contains updated variansts
  * @return {Array } All updated variants
 */
async function loopProductVariantsSlice(product, productList) {
  // Loop over variants
  for (let index = 0; index < product.totalVariants; index++) {
    const variant = product.variants.nodes[index];

    // Skip variants without barcode (required for google shopping query)
    if (!variant.barcode) {
      functions.logger.log("Variant has not barcode", variant.id, variant.displayName, {
        structuredData: true,
      });
      continue;
    }

    const googleShoppingData = await getGoogleShoppingData.getGoogleShoppingData(product.id, variant.barcode);

    // skip variant if Google Shopping data could not be loaded
    if (!googleShoppingData && !googleShoppingData.product_results) {
      functions.logger.warn("Could not load google shopping data for", variant.id, variant.displayName, googleShoppingData.error, {
        structuredData: true,
      });
    }

    // skip variant if there is no google shopping data for the variant
    if (googleShoppingData.product_results.error) {
      functions.logger.warn("No google shopping data for", variant.id, variant.displayName, googleShoppingData.product_results.error, {
        structuredData: true,
      });
    }

    // add title
    const resultProductTitle = await updateProductTitle(product, googleShoppingData.product_results.title);

    if (resultProductTitle) {
      productList.push({
        title: {
          productId: resultProductTitle.productUpdate.product.id,
          productTitle: resultProductTitle.productUpdate.product.title,
        },
      });
    }

    // add description
    const resultProductDescription = await updateProductDescription(product, googleShoppingData.product_results.description);

    if (resultProductDescription) {
      productList.push({
        description: {
          productId: resultProductDescription.productUpdate.product.id,
          productTitle: resultProductDescription.productUpdate.product.title,
        },
      });
    }

    //
    // add image
    const resultAddImageToProductVariant = await addImageToProductVariant(product, variant, googleShoppingData);

    if (resultAddImageToProductVariant) {
      productList.push({
        image: {
          variantId: resultAddImageToProductVariant.id,
          variantDisplayName: resultAddImageToProductVariant.displayName,
        },
      });
    }
  }

  return productList;
}


