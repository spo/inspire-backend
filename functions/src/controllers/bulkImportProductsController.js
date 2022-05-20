const {getBSStockData} = require("../services/common/getBSData");

exports.bulkImportProducts = async () => {
  const BSStockData = getBSStockData();

  console.log(BSStockData);
};
