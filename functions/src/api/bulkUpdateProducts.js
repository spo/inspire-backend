const functions = require("firebase-functions");

const {bulkUpdateProducts} = require("./../controllers/bulkUpdateProductsController");

exports.bulkUpdateProducts = functions.https.onRequest(async (req, res) => {
  try {
    const resultBulkUpdateProducts = await bulkUpdateProducts(req.body.minimumStock);
    res.status(200).send({data: resultBulkUpdateProducts});
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
