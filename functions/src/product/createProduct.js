const functions = require("firebase-functions");
const {gql, request} = require("graphql-request");
const config = require("../../config");

exports.createProduct = functions.https.onRequest(async (req, res) => {
  const query = gql`
    {
        productVariants(first: 10) {
        edges {
            node {
            id
            }
        }
        }
    }
    `;

  const data2 = await request(config.shopify.endpoint, query);

  res.send(data2);
});
