const functions = require("firebase-functions");
const {productCreateMedia} = require("../graphQl/product/mutation/productCreateMedia");
const {productVariantAppendMedia} = require("../graphQl/product/mutation/productVariantAppendMedia");

/**
 * Add image to product variant
 * @param {object} product Product that includes variants
 * @param {object} variant Variants to add images
 * @param {object} googleShoppingData Product information from google shopping
 * @return {object} The variant object
 */
exports.addImageToProductVariant= async (product, variant, googleShoppingData) => {
  // Skip variants with existing images
  if (variant.image ) {
    functions.logger.warn("Variant has existing images already", variant.id, variant.displayName, {
      structuredData: true,
    });
    return;
  }

  const {media, error} = googleShoppingData.product_results;

  // Skip if no google shopping media data
  if (error) {
    functions.logger.warn("No google shopping media data for", variant.id, variant.displayName, error, {
      structuredData: true,
    });
    return;
  }

  // Use alwasy first image from google shopping result
  const medium = media[0];

  // Skip non image types
  if (!medium.type === "image") {
    functions.logger.warn("No image type for variant", variant.id, variant.displayName, {
      structuredData: true,
    });
    return;
  }

  const resultProductCreateMedia = await productCreateMedia(medium.link, product.title, product.id);

  const productMedia = resultProductCreateMedia.productCreateMedia;
  const {code, field, message} = productMedia.mediaUserErrors;

  if (productMedia.mediaUserErrors.length > 0 ) {
    functions.logger.info("Could not create media for variant", variant.id, variant.displayName, code, field, message, {
      structuredData: true,
    });
    return;
  } else {
    functions.logger.info("Create media for variant", variant.id, variant.displayName, {
      structuredData: true,
    });
  }

  const mediaId = productMedia.media[0].id;

  // Poll each sec until media is ready
  const resultProductVariantAppendMedia = await pollProductVariantAppendMedia(() => productVariantAppendMedia(product.id, variant.id, mediaId), "NON_READY_MEDIA", 1000);

  if (resultProductVariantAppendMedia.userErrors && resultProductVariantAppendMedia.userErrors.length > 0) {
    const {code, field, message} = resultProductVariantAppendMedia.userErrors[0];
    functions.logger.info("Could not attach media to variant", variant.id, variant.displayName, code, field, message, {
      structuredData: true,
    });
    return;
  } else {
    functions.logger.log("Attach media to variant", variant.id, variant.displayName, {
      structuredData: true,
    });

    return variant;
  }
};

/**
 * Polling media until media is ready to use.
 * https://community.shopify.com/c/shopify-apis-and-sdks/productcreatemedia-mutation-not-returning-preview-image/td-p/854553
 *
 *  @param {function} fn Function to poll
 *  @param {string} fnCondition Condition that stops polling
 *  @param {number} ms How many milliseconds wait until next poll
 *  @return {object} Ready media object
 */
const pollProductVariantAppendMedia = async function(fn, fnCondition, ms) {
  let result = await fn();

  while (result.productVariantAppendMedia.userErrors.some((e) => e.code === fnCondition)) {
    await wait(ms);
    result = await fn();

    if (result.productVariantAppendMedia.userErrors.some((e) => e.code === "INVALID")) {
      continue;
    }
  }
  return result;
};

/**
   * Wait for a given time
   * @param {number} ms How many milliseconds to wait
   * @return {Promise} The promise when timer has expired
   */
const wait = function(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
