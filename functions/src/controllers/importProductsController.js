const {importProducts} = require("../services/product/importProductsService");

exports.importProducts = async (slice) => {
  const importedProducts = await importProducts(slice);
  return importedProducts;
};
