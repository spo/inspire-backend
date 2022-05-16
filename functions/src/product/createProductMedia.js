/* eslint-disable max-len */
const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../config");
const scrapeProductData = require("../scrapeProductData");

// Query all products
// TODO: rename: bulkUpdateProducts
exports.queryAllProducts = functions.https.onRequest(async (req, res) => {
  const minimumStock = req.body.minimumStock;
  const productList = [];
  let hasMoreProductsToLoad = true;
  let cursor = null;

  // Loop over all products
  // TODO: hasMoreProductsToLoad = true, statt oben zu inizialisieren.
  while (hasMoreProductsToLoad) {
    const result = await loopProductsSlice(productList, minimumStock, cursor);
    hasMoreProductsToLoad = result.hasNextPage;
    cursor = result.endCursor;
  }

  try {
    res.status(200).send({data: productList});
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

// TODO image und description aufteilen
/**
 * Loop over all products
 *
 * @param {Array} productList Contains all products
 * @param {number} minimumStock minimum required stock to update product
 * @param {string} cursor The cursor corresponding to the last node in edges
 */
async function loopProductsSlice(productList, minimumStock, cursor) {
  const productsSlice = await queryProductsSlice(cursor);
  const totalProducts = productsSlice.products.nodes.length;
  const products = productsSlice.products.nodes;
  const endCursor = productsSlice.products.pageInfo.endCursor;
  const hasNextPage = productsSlice.products.pageInfo.hasNextPage;

  // Stop if no products available
  if (totalProducts <= 0) {
    throw new functions.https.HttpsError("aborted", "No products available", productsSlice);
  }

  // loop over products slice
  for (let index = 0; index < totalProducts; index++) {
    const product = products[index];

    // Update product data only when at least one variant exists
    if (product.totalVariants > 0) {
      const totalInventory = product.totalInventory;

      // only update product data when product has a given minium stock
      if (totalInventory > minimumStock) {
        // loop over variants
        for (let index = 0; index < product.totalVariants; index++) {
          const variant = product.variants.nodes[index];
          const barcode = variant.barcode;

          // skip variants with existing images
          if (!variant.image) {
            // only update variants with barcode in order to use google shopping
            if (barcode) {
              const productData = await scrapeProductData.scrapProductData(product.id, barcode);

              // skip variant if there is no google shopping data for the variant
              if (productData && productData.product_results && productData.product_results.media) {
                // const {description, media} = productData.product_results;
                const {media} = productData.product_results;


                // add image to variant
                if (media && media.length > 0) {
                  await addImageToProductVariant(product.id, product.title, media[0], variant.id, variant.displayName);
                }

                // TODO: add description
                // console.log("description", description);

                const products = {
                  id: product.id,
                  variant: variant.displayName,
                };

                productList.push(products);
              } else {
                functions.logger.log("No google shopping media data for", variant.id, variant.displayName, productData.error, {
                  structuredData: true,
                });
                // TODO: hier if... add description
                // console.log("description", description);s
              }
            } else {
              functions.logger.log("Variant has not barcode", variant.id, variant.displayName, {
                structuredData: true,
              });
            }
          } else {
            functions.logger.log("Variant has existing images already", variant.id, variant.displayName, {
              structuredData: true,
            });
          }
        }
      } else {
        functions.logger.log("No stock for product", product.id, product.title, {
          structuredData: true,
        });
      }
    } else {
      functions.logger.log("No variants for product", product.id, product.title, {
        structuredData: true,
      });
    }
  }


  return {productList, endCursor, hasNextPage};
}

// eslint-disable-next-line require-jsdoc
async function addImageToProductVariant(productId, productTitle, googleShoppingMedia, variantId, variantDisplayName) {
  // only add type image
  if (googleShoppingMedia.type === "image") {
    const resultProductCreateMedia = await mutationProductCreateMedia(googleShoppingMedia.link, productTitle, productId);

    const productCreateMedia = resultProductCreateMedia.productCreateMedia;
    const {code, field, message} = productCreateMedia.mediaUserErrors;

    if (productCreateMedia.mediaUserErrors.length > 0 ) {
      functions.logger.info("Could not create media for product", productId, code, field, message, {
        structuredData: true,
      });
    } else {
      // wait 3 sec until media changed status from uploaded to ready -> https://community.shopify.com/c/shopify-apis-and-sdks/productcreatemedia-mutation-not-returning-preview-image/td-p/854553
      // await delay(3000); // TODO pooling statt warten und 5 mal oder so status abfragen bis ready. Immer dazwischen 2 sekunden warten


      const mediaId = productCreateMedia.media[0].id;
      // const resultProductMediaStatus = await queryProductMediaStatus(mediaId);
      const fnProductVariantAppendMedia = productVariantAppendMedia(productId, variantId, mediaId);

      const responseTest = await poll(fnProductVariantAppendMedia, "READY", 1);

      console.log("response Test", responseTest);


      // const resultProductVariantAppendMedia = await productVariantAppendMedia(productId, variantId, mediaId);
      // const variantAppendMedia = resultProductVariantAppendMedia.productVariantAppendMedia;

      const variantAppendMedia = false;

      if (variantAppendMedia.userErrors && variantAppendMedia.userErrors.length > 0 ) {
        const {code, field, message} = variantAppendMedia.userErrors[0];
        functions.logger.info("Could not attach media to variant", variantId, variantDisplayName, code, field, message, {
          structuredData: true,
        });
      } else {
        // eslint-disable-next-line no-undef
        functions.logger.log("Attatched media for variant", variantId, variantDisplayName, {
          structuredData: true,
        });
      }
    }
  }
}

// TODO: delete
// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// TODO: move to helper
/**
 * Test
 *  @param {function} fn asdf
//  *  @param {boolean} fnCondition asdf
 *  @param {number} ms asdf
 *  @return {promises} alskdf
 */
const poll = async function(fn, ms) {
  let result = await fn;
  while (result.productVariantAppendMedia.userErrors.length < 0) {
    await wait(ms);
    result = await fn;
  }
  return result;
};

/**
 * TODO
 * @param {number} ms asdf
 * @return {promises}
 */
const wait = function(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const testResult = function() {
  return 5;
};

/**
 * Load all products in slices
 * // TODO: Hier weiter machen:
// 1) Produkte mit BulkOperations aus Shopify laden
// 2) Dann mit EAN Bilder von ScrapAPI laden
// 3) und mit mutation productCreateMedia in Shopify laden
// 4) dann mit mutation productVariantAppendMedia Bilder zur Variante hinzufügen
 *
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
 * @param {string} productId The image url
 * @param {displayName} variantId The title is used for image alt
 * @param {string} mediaId The product id to attach the image to the right product
*/
const productVariantAppendMedia = async (productId, variantId, mediaId) => {
  const mutationProductCreateMedia = gql`
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
    const data = await request(config.shopify.endpoint, mutationProductCreateMedia, variables);
    return data;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field, error.code);
  }
};

/**
 * Query product media status by id.
 * @param {string} mediaImageId
 *  @return {object} Product slice objects
 */
async function queryProductMediaStatus(mediaImageId) {
  const queryMediaImage = gql`
    query ($mediaImageId: ID!) {
      node(id: $mediaImageId) {
        id
        ... on MediaImage {
          status
        }
      }
    }
  
  `;

  const variables = {
    mediaImageId,
  };

  try {
    const data = await request(config.shopify.endpoint, queryMediaImage, variables);
    return data; // TODO return only status
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
}


