const functions = require("firebase-functions");
const {productsByTitle} = require("../services/graphQl/product/query/productsByTitle");
const {productsSlice} = require("../services/graphQl/product/query/productsSlice");
const {apiWait} = require("../utils/apiWait");

/**
 * Check if there are duplicate products by title
 * @param {string} query Query filter options
 */
exports.duplicateProducts = async (query = "") => {
  let hasMoreProductsToLoad = true;
  let cursor = null;
  let result = null;
  const productList = [];

  try {
    // Loop over all products. The products are loaded with paggination.
    while (hasMoreProductsToLoad) {
      result = await loopProductsSlice(productList, cursor, query);
      hasMoreProductsToLoad = result.hasNextPage;
      cursor = result.endCursor;
    }

    return result.productList;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
};

/**
 * Loop over all products
* @param {Array} productList The product list contains duplicate products
* @param {string} cursor The cursor corresponding to the last node in edges
 * @param {string} query Query filter options
 */
async function loopProductsSlice(productList, cursor, query) {
  const resultProductsSlice = await productsSlice(cursor, query);
  const totalProducts = resultProductsSlice.products.nodes.length;
  const products = resultProductsSlice.products.nodes;
  const endCursor = resultProductsSlice.products.pageInfo.endCursor;
  const hasNextPage = resultProductsSlice.products.pageInfo.hasNextPage;

  // Stop if no products available
  if (!totalProducts > 0) {
    throw new functions.https.HttpsError("aborted", "No products available", resultProductsSlice);
  }

  // Loop over product slice
  for (let index = 0; index < totalProducts; index++) {
    const product = products[index];

    const resultProductsByTitle = await productsByTitle(product.title);

    if (resultProductsByTitle && resultProductsByTitle.extensions) {
      await apiWait(resultProductsByTitle.extensions);
    }

    if (resultProductsByTitle.data.length > 1) {
      productList.push(...resultProductsByTitle.data);
    }
  }

  return {productList: productList, endCursor, hasNextPage};
}
