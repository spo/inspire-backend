const functions = require("firebase-functions");


const {productTag} = require("../graphQl/product/query/productTag");
const {productCreateBs} = require("../graphQl/product/mutation/productCreate/productCreateBs");
const {productVariantCreateBs} = require("../graphQl/product/mutation/productCreate/productVariantCreateBs");
const {productVariantCreatePrivateMetafields} = require("../graphQl/product/mutation/productCreate/productVariantCreatePrivateMetafields");
const {productCreatePrivateMetafields} = require("../graphQl/product/mutation/productCreate/productCreatePrivateMetafields");
const {apiWait} = require("../../utils/apiWait");


/**
 * Create new product or product variant
* @param {object} productVariantToImport Product variant to be imported
 */
exports.importProductVariant = async (productVariantToImport) => {
  try {
    const product = await productTag(productVariantToImport.description);

    if (product && product.extensions) {
      await apiWait(product.extensions);
    }

    if (product.data.length > 0) {
      const variant = await createProductVariantWithPrivateMetafields(productVariantToImport, product.data[0].id);
      return variant;
    } else {
      const product = await createProductWithPrivateMetafields(productVariantToImport);
      return product;
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

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

    if (newProduct && newProduct.data.variants.nodes.length > 0 && newProduct.data.variants.nodes[0].id) {
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
