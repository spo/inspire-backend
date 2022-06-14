const functions = require("firebase-functions");
const {importProductsController, updateProductsController} = require("./src/controllers");

// functions
exports.importProducts = functions.runWith({
  memory: "2GB",
  timeoutSeconds: 540,
}).https.onCall(async (data) => {
  try {
    const resultImportProducts = await importProductsController.importProducts(data.slice);
    return {data: resultImportProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

exports.updateProducts = functions.https.onCall(async (data) => {
  try {
    const resultUpdateProducts = await updateProductsController.updateProducts(data.minimumStock);
    return {data: resultUpdateProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
