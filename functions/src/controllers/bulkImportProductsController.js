const {bulkImportProducts} = require("../services/product/bulkImportProductsService");

exports.bulkImportProducts = async (slice) => {
  const importedProducts = await bulkImportProducts(slice);

  return importedProducts;
};
