const functions = require("firebase-functions");
const {getGoogleShoppingData} = require("../services/common/getGoogleShoppingData");
const {updateProductsService} = require("../services");
const {productsSlice} = require("../services/graphQl/product/query/productsSlice");

/**
 * Update title, description, images for all products including variants.
 * @param {number} minimumStock Minimum required stock in order to update product
 * @param {boolean} updateTitle Whether to update the title
 * @param {string} query Query filter options
 */
exports.updateProducts = async (minimumStock = 0, updateTitle = false, query = "") => {
  const productList = [];
  let hasMoreProductsToLoad = true;
  let cursor = null;

  if (!Number.isInteger(minimumStock)) {
    throw new functions.https.HttpsError("invalidArgument", "Minimum stock must be an integer");
  }

  try {
    // Loop over all products. The products are loaded with paggination.
    while (hasMoreProductsToLoad) {
      const result = await loopProductsSlice(productList, minimumStock, updateTitle, cursor, query);
      hasMoreProductsToLoad = result.hasNextPage;
      cursor = result.endCursor;
    }

    return productList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};

/**
 * Loop over all products
 *
 * @param {Array} productList List contains updated products/variansts
 * @param {number} minimumStock Minimum required stock in order to update product
 * @param {boolean} updateTitle Whether to update the title
 * @param {string} cursor The cursor corresponding to the last node in edges
 * @param {string} query Query filter options
 */
async function loopProductsSlice(productList, minimumStock, updateTitle, cursor, query) {
  const resultProductsSlice = await productsSlice(cursor, query);
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
    if (!(product.totalInventory >= minimumStock)) {
      functions.logger.warn("Not given minimum stock for product", product.id, product.title, minimumStock, {
        structuredData: true,
      });
      continue;
    }

    await loopProductVariantsSlice(product, productList, updateTitle);
  }

  return {productList, endCursor, hasNextPage};
}

/**
 * Loop over variants slice and update variants
 * @param {object} product Product that includes variants to loop over
 * @param {Array} productList List contains updated products/variansts
 * @param {boolean} updateTitle Whether to update the title
 * @return {Array} All updated variants
 *
 */
async function loopProductVariantsSlice(product, productList, updateTitle) {
  // Loop over variants
  for (let index = 0; index < product.totalVariants; index++) {
    const variant = product.variants.nodes[index];

    // Skip variants without barcode (required for google shopping query)
    if (!variant.barcode) {
      functions.logger.log("Variant has no barcode", variant.id, variant.displayName, {
        structuredData: true,
      });
      continue;
    }

    const updateRequired = isUpdateRequired(product, updateTitle);

    if (!updateRequired) {
      continue;
    }

    const googleShoppingData = await getGoogleShoppingData(product.id, variant.barcode);

    // skip variant if google shopping data could not be loaded
    if (googleShoppingData.error) {
      continue;
    }

    if (updateTitle) {
      // add title
      const resultProductTitle = await updateProductsService.updateProductTitle(product, googleShoppingData.product_results.title);

      if (resultProductTitle) {
        productList.push({
          title: {
            productId: resultProductTitle.productUpdate.product.id,
            productTitle: resultProductTitle.productUpdate.product.title,
          },
        });
      }
    }

    // add description
    const resultProductDescription = await updateProductsService.updateProductDescription(product, googleShoppingData.product_results.description);

    if (resultProductDescription) {
      productList.push({
        description: {
          productId: resultProductDescription.productUpdate.product.id,
          productTitle: resultProductDescription.productUpdate.product.title,
        },
      });
    }

    // add image
    const resultProductImage = await updateProductsService.updateProductImage(product, variant, googleShoppingData.product_results.media);

    if (resultProductImage) {
      productList.push({
        image: {
          variantId: resultProductImage.id,
          variantDisplayName: resultProductImage.displayName,
        },
      });
    }
  }

  return productList;
}

/**
 * Check whether an update must be carried out. If the title, description and images are already available, avoid an update.
 * @param {*} product
 * @param {*} updateTitle
 * @return {boolean} True or false whether an update is necessary
 */
function isUpdateRequired(product, updateTitle) {
  if (!updateTitle && product.bodyHtml !== "" && product.variants.nodes.length > 0 && product.variants.nodes[0].image) {
    return false;
  } else {
    return true;
  }
}
