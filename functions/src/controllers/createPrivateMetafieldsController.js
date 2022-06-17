const functions = require("firebase-functions");
const {getBsProductByArticleNumber} = require("../services/common/getBsProductByArticleNumber");
const {productVariantsByBarcode} = require("../services/graphQl/product/query/productVariantsByBarcode");
const {productCreatePrivateMetafields} = require("../services/graphQl/product/mutation/productCreate/productCreatePrivateMetafields");
const {productVariantCreatePrivateMetafields} = require("../services/graphQl/product/mutation/productCreate/productVariantCreatePrivateMetafields");


exports.createPrivateMetafields = async (barcode, articleNumber, updateOnlyVaraint) => {
  try {
    const bsProductVariant = await getBsProductByArticleNumber(articleNumber);
    const productVariant = await productVariantsByBarcode(barcode);
    const result = await startCreatingPrivateMetafields(productVariant.data[0].node, bsProductVariant, updateOnlyVaraint);
    return result;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Add private meta fields to product variant and or to product
 * @param {object} productVariant Product variant to which private meta fields are added
 * @param {object} bsProductVariant The BS product variant to get private meta field infos
 * @param {boolean} updateOnlyVaraint Specifies whether to add priavte meta fields to the product. If yes, the "inizialised_title" will be added.
 * @return {Promise<object>} The product variant with the updated private meta fields.
 */
const startCreatingPrivateMetafields = async (productVariant, bsProductVariant, updateOnlyVaraint) => {
  try {
    if (!productVariant) {
      throw new functions.https.HttpsError("not-found", "The product variant is not defined", "productVariant-not-defined");
    }

    if (!bsProductVariant) {
      throw new functions.https.HttpsError("not-found", "The bs product variant is not defined", "bsProductVariant-not-defined");
    }

    if (!updateOnlyVaraint) {
      await productCreatePrivateMetafields(productVariant.product.id);
    }

    const resultProductVariantCreatePrivateMetafields = await productVariantCreatePrivateMetafields(productVariant.id, bsProductVariant);

    if (resultProductVariantCreatePrivateMetafields) {
      return {
        productId: resultProductVariantCreatePrivateMetafields.data.product.id,
        variantId: resultProductVariantCreatePrivateMetafields.data.productVariant.id,
        barcode: resultProductVariantCreatePrivateMetafields.data.productVariant.barcode,
        title: resultProductVariantCreatePrivateMetafields.data.product.title,
        displayName: resultProductVariantCreatePrivateMetafields.data.productVariant.displayName,
      };
    } else {
      return {};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};
