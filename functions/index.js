const functions = require("firebase-functions");
const {importProductsController, updateProductsController, missingProductsController} = require("./src/controllers");

const runOptions = {
  memory: "2GB",
  timeoutSeconds: 540,
};

// functions
exports.importProducts = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultImportProducts = await importProductsController.importProducts(data.slice);
    return {data: resultImportProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

exports.updateProducts = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultUpdateProducts = await updateProductsController.updateProducts(data.minimumStock, data.updateTitle, data.query);
    return {data: resultUpdateProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

exports.missingProducts = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultMissingProducts = await missingProductsController.missingProducts(data.slice);
    return {data: resultMissingProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
