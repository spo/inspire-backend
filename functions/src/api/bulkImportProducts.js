const functions = require("firebase-functions");
const {bulkImportProductsController} = require("../controllers");

exports.bulkImportProducts = functions.https.onRequest(async (req, res) => {
  try {
    const resultBulkImportProducts = await bulkImportProductsController.bulkImportProducts();

    res.status(200).send({data: resultBulkImportProducts});
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
