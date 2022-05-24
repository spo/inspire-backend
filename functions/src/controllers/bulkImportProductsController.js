const {bulkImportProducts} = require("../services/product/bulkImportProductsService");

exports.bulkImportProducts = async () => {
  const importedProducts = await bulkImportProducts();

  return importedProducts;
};
