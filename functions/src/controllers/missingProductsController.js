const {missingProductsService} = require("../services/index");

exports.missingProducts = async (slice) => {
  const missedProducts = await missingProductsService.missingProducts(slice);
  return missedProducts;
};
