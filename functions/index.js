const scrapeProductData = require("./src/scrapeProductData");
const createProduct = require("./src/product/createProduct");
const createProductMedia = require("./src/product/createProductMedia");

// functions
exports.scrapProductData = scrapeProductData.scrapProductData;
exports.createProduct = createProduct.createProduct;
exports.createProductMedia = createProductMedia.createProductMedia;
exports.loadProductMedia = createProductMedia.loadProductMedia;
exports.queryAllProducts = createProductMedia.queryAllProducts;
