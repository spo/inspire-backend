const {shopify} = require("../../config/config");

/**
   * Calculate variant option for BS color
   * @param {string} color The BS color
   * @return {string} The variant option
   */
exports.checkColorOption = (color) => {
  switch (color) {
    case "-":
    case "":
      return null;
    default:
      return shopify.options.color;
  }
};


