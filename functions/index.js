const functions = require("firebase-functions");
const {importProductsController,
  importProductController,
  updateProductsController,
  missingProductsController,
  missingProductsPrivateFieldsController,
  duplicateProductsController,
  createPrivateMetafieldsController} = require("./src/controllers");

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

exports.importProduct = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultImportProduct = await importProductController.importProduct(data.articleNumber);
    return {data: resultImportProduct};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

exports.createPrivateMetafields = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultCreatePrivateMetafields = await createPrivateMetafieldsController.createPrivateMetafields(data.barcode, data.articleNumber, data.updateOnlyVaraint);
    return {data: resultCreatePrivateMetafields};
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

exports.missingProductsPrivateFields = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultMissingProductsPrivateFields = await missingProductsPrivateFieldsController.missingProductsPrivateFields(data.query);
    return {data: resultMissingProductsPrivateFields};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});

exports.duplicateProducts = functions.runWith(runOptions).https.onCall(async (data) => {
  try {
    const resultDuplicateProducts = await duplicateProductsController.duplicateProducts(data.query);
    return {data: resultDuplicateProducts};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message, error.field);
  }
});
// test
