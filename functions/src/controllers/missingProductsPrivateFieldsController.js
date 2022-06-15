const functions = require("firebase-functions");
const {productVariants} = require("../services/graphQl/product/query/productVariants");

/**
 * Check if private fields are missing
 * @param {string} query Query filter options
 */
exports.missingProductsPrivateFields = async (query = "") => {
  let hasMoreProductsToLoad = true;
  let cursor = null;
  let result = null;

  try {
    // Loop over all product variants. The product variants are loaded with paggination.
    while (hasMoreProductsToLoad) {
      result = await loopProductVariantsSlice(cursor, query);
      hasMoreProductsToLoad = result.hasNextPage;
      cursor = result.endCursor;
    }

    return result.productVariantsList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};

/**
 * Loop over all products
 * @param {string} cursor The cursor corresponding to the last node in edges
 * @param {string} query Query filter options
 */
async function loopProductVariantsSlice(cursor, query) {
  const productVariantsList = [];
  const resultProductVariantsSlice = await productVariants(cursor, query);
  const totalProductVariants = resultProductVariantsSlice.data.nodes.length;
  const variants = resultProductVariantsSlice.data.nodes;
  const endCursor = resultProductVariantsSlice.data.pageInfo.endCursor;
  const hasNextPage = resultProductVariantsSlice.data.pageInfo.hasNextPage;

  // Stop if no variants available
  if (!totalProductVariants > 0) {
    throw new functions.https.HttpsError("aborted", "No product variants available", resultProductVariantsSlice);
  }

  // Loop over product variants slice
  for (let index = 0; index < totalProductVariants; index++) {
    const variant = variants[index];

    if (!variant.privateMetafield) {
      productVariantsList.push({
        title: variant.displayName,
        barcode: variant.barcode,
      });
    }
  }

  return {productVariantsList, endCursor, hasNextPage};
}
