const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../config/config");
const getGoogleShoppingData = require("../services/common/getGoogleShoppingData");
const {updateProductTitle} = require("../services/product/updateProductTitle");
const {updateProductDescription} = require("../services/product/updateProductDescription");

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
  const productsSlice = await queryProductsSlice(cursor);
  const totalProducts = productsSlice.products.nodes.length;
  const products = productsSlice.products.nodes;
  const endCursor = productsSlice.products.pageInfo.endCursor;
  const hasNextPage = productsSlice.products.pageInfo.hasNextPage;

  // Stop if no products available
  if (!totalProducts > 0) {
    throw new functions.https.HttpsError("aborted", "No products available", productsSlice);
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

    // skip variant if there is no google shopping data for the variant
    if (!googleShoppingData && !googleShoppingData.product_results) {
      functions.logger.warn("No google shopping data for", variant.id, variant.displayName, googleShoppingData.error, {
        structuredData: true,
      });
    }

    // add title
    const resultProductTitle = await updateProductTitle(product, googleShoppingData);

    if (resultProductTitle) {
      productList.push({
        title: {
          productId: resultProductTitle.productUpdate.product.id,
          productTitle: resultProductTitle.productUpdate.product.title,
        },
      });
    }

    // add description
    const resultProductDescription = await updateProductDescription(product, googleShoppingData);

    if (resultProductDescription) {
      productList.push({
        description: {
          productId: resultProductDescription.productUpdate.product.id,
          productTitle: resultProductDescription.productUpdate.product.title,
        },
      });
    }

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

// TODO: move to services
/**
 * Add image to product variant
 * @param {object} product Product that includes variants
 * @param {object} variant Variants to add images
 * @param {object} googleShoppingData Product information from google shopping
 * @return {object} The variant object
 */
async function addImageToProductVariant(product, variant, googleShoppingData) {
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

  const resultProductCreateMedia = await mutationProductCreateMedia(medium.link, product.title, product.id);

  const {productCreateMedia} = resultProductCreateMedia;
  const {code, field, message} = productCreateMedia.mediaUserErrors;

  if (productCreateMedia.mediaUserErrors.length > 0 ) {
    functions.logger.info("Could not create media for variant", variant.id, variant.displayName, code, field, message, {
      structuredData: true,
    });
    return;
  } else {
    functions.logger.info("Create media for variant", variant.id, variant.displayName, {
      structuredData: true,
    });
  }

  const mediaId = productCreateMedia.media[0].id;

  // Poll each sec until media is ready
  const resultProductVariantAppendMedia = await pollProductVariantAppendMedia(() => mutationProductVariantAppendMedia(product.id, variant.id, mediaId), "NON_READY_MEDIA", 1000);

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
}

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

/**
 * Load all products in slices. Limit: 100 variants!
 * @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product slice objects
 */
async function queryProductsSlice(cursor) {
  const queryProductsSlice = gql`
  query ($numProducts: Int!, $cursor: String) {
    products(first: $numProducts, after: $cursor) {
      nodes {
        id
        title
        totalInventory
        totalVariants
        privateMetafield(key: "title_inizialised", namespace: "title") {
          value
          valueType
        }
        variants(first: 100) {
          nodes {
            id
            displayName
            barcode
            image {
              id
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }  
    `;

  const variables = {
    numProducts: 3,
    cursor: cursor,
  };

  try {
    const productSlice = await request(config.shopify.endpoint, queryProductsSlice, variables);
    return productSlice;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
}


/**
 * Add media to product
 * @param {string} originalSource The image url
 * @param {displayName} title The title is used for image alt
 * @param {string} productId The product id to attach the image to the right product
*/
async function mutationProductCreateMedia(originalSource, title, productId) {
  const mutationProductCreateMedia = gql`
  mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
    productCreateMedia(media: $media, productId: $productId) {
      media {
        status
        mediaContentType
        ... on MediaImage {
          id
        }
      }
      mediaUserErrors {
        code
        field
        message
      }
      product {
        id
      }
    }
  }
    `;

  const variables = {
    media: {
      alt: title,
      mediaContentType: "IMAGE",
      originalSource,
    },
    productId,
  };

  try {
    const data = await request(config.shopify.endpoint, mutationProductCreateMedia, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
}


/**
 * Attach media to product variant
 * @param {string} productId The product id
 * @param {string} variantId The variant id
 * @param {string} mediaId The media id
*/
const mutationProductVariantAppendMedia = async (productId, variantId, mediaId) => {
  const mutationProductVariantAppendMedia = gql`
  mutation ($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
    productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
      product {
        id
        title
      }
      userErrors {
        code
        field
        message
      }
    }
  }
    `;

  const variables = {
    productId,
    variantMedia: [
      {
        variantId,
        mediaIds: [mediaId],
      },
    ],
  };

  try {
    const data = await request(config.shopify.endpoint, mutationProductVariantAppendMedia, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};


