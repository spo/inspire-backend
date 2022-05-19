const functions = require("firebase-functions");
const {bulkUpdateProductsController} = require("../controllers/");

exports.bulkUpdateProducts = functions.https.onRequest(async (req, res) => {
  try {
    const resultBulkUpdateProducts = await bulkUpdateProductsController.bulkUpdateProducts(req.body.minimumStock);
    res.status(200).send({data: resultBulkUpdateProducts});
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
