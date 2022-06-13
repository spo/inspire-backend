const functions = require("firebase-functions");
const {bulkImportProductsController} = require("../controllers");

const runtimeOpts = {
  memory: "2GB",
  timeoutSeconds: 540,
};

exports.bulkImportProducts = functions.runWith(runtimeOpts).https.onCall(async (data) => {
  try {
    const resultBulkImportProducts = await bulkImportProductsController.bulkImportProducts(data.slice);
    return {data: resultBulkImportProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
