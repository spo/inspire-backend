const functions = require("firebase-functions");
const {gql, rawRequest} = require("graphql-request");
const {shopify} = require("../../../../config/config");

/**
 * Get product variants
* @param {string} cursor The cursor corresponding to the last node in edges
 * @return {object} Product variants with private metafields "bs_description"
 * @param {string} query Query filter options
 */
exports.productVariants = async (cursor, query) => {
  try {
    const queryProductVariants = gql `query ($namespace: String!, $key: String!, $numProducts: Int!, $cursor: String, $query: String!) {
      productVariants(first: $numProducts, after: $cursor, query: $query,) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          barcode
          displayName
          privateMetafield(namespace: $namespace, key: $key) {
            id
            value
          }
          product {
            id
          }
        }
      }
    }`;

    const variables = {
      namespace: shopify.privateMetafields.product.namespace,
      key: shopify.privateMetafields.product.bs.description,
      numProducts: 10,
      cursor,
      query: query,
    };

    const {data, errors, extensions} = await rawRequest(shopify.endpoint, queryProductVariants, variables);


    if (errors) {
      throw new functions.https.HttpsError("internal", errors);
    }

    if (data.productVariants.userErrors && data.productVariants.userErrors.length > 0) {
      functions.logger.warn("Could not query product variant", data.productVariants.userErrors, {
        structuredData: true,
      });
    } else {
      return {data: data.productVariants, extensions: extensions.cost};
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.code, error.type);
  }
};
