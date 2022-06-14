const functions = require("firebase-functions");
const {productCreateMedia} = require("../graphQl/product/mutation/productCreateMedia");
const {productVariantAppendMedia} = require("../graphQl/product/mutation/productVariantAppendMedia");
const {productDescription} = require("../graphQl/product/query/productDescription");
const {productUpdate} = require("../graphQl/product/mutation/productUpdate");
const {productUpdateTitleInizialised} = require("../graphQl/product/mutation/productUpdateTitleInizialised");
const {wait} = require("../../utils/wait");

/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {string} title Title to be updated
 * @return {object} The product object
 */
exports.updateProductTitle = async (product, title) => {
  // Skip if no title provided
  if (!title) {
    functions.logger.warn("No title provided", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip if title is empty
  if (title === "") {
    functions.logger.warn("An empty title cannot be updated", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip if no product id provided
  if (!product.id) {
    functions.logger.warn("No product id provided", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants without privateMetafield
  if (!product.privateMetafield) {
    functions.logger.warn("Product title could not be updated because no privateMetafield exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants without privateMetafield value
  if (!product.privateMetafield.value) {
    functions.logger.warn("Product title could not be updated because no privateMetafield with value exists", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants that already has been initialised title
  if (product.privateMetafield.value === "true") {
    functions.logger.warn("Product has already been initialised_title", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const resultProductUpdate = await productUpdate(product.id, title, "");

  if (resultProductUpdate.productUpdate) {
    functions.logger.info("Updated product title for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
      structuredData: true,
    });
    await productUpdateTitleInizialised(product.id, "true");
  }

  return resultProductUpdate;
};

/**
 * Add description to product variant
 * @param {object} product Product to be updated
 * @param {string} description Description to be updated
 * @return {object} The updated product object
 */
exports.updateProductDescription = async (product, description) => {
  // Skip if no description provided
  if (description === "") {
    functions.logger.warn("An empty description cannot be updated", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip if no product id provided
  if (!product.id) {
    functions.logger.warn("No product id provided", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const resultProductDescription = await productDescription(product.id);

  // Skip variants with existing description
  if (resultProductDescription.product == null) {
    functions.logger.warn("Could not load product description for", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  if (resultProductDescription.product.bodyHtml) {
    functions.logger.warn("Product already has a description", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  const resultProductUpdate = await productUpdate(product.id, "", description);


  functions.logger.info("Updated product description for", resultProductUpdate.productUpdate.product.id, resultProductUpdate.productUpdate.product.title, {
    structuredData: true,
  });

  return resultProductUpdate;
};


/**
 * Add image to product variant
 * @param {object} product Product that includes variants
 * @param {object} variant Variants to add images
 * @param {object} media Media such as images
 * @return {object} The variant object
 */
exports.updateProductImage= async (product, variant, media) => {
  // Skip if no product id provided
  if (!product.id) {
    functions.logger.warn("No product id provided", product.id, product.title, {
      structuredData: true,
    });
    return;
  }

  // Skip variants with existing images
  if (variant.image) {
    functions.logger.warn("Variant has existing images already", variant.id, variant.displayName, {
      structuredData: true,
    });
    return;
  }

  // Skip if no google shopping media data
  if (!media) {
    functions.logger.warn("No google shopping media data for", variant.id, variant.displayName, {
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
    functions.logger.warn("Could not attach media to variant", variant.id, variant.displayName, code, field, message, {
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
