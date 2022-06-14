const {shopify} = require("../../config/config");

/**
   * Calculate variant option for BS additional product information
   * @param {string} selection The BS additional product information
   * @return {string} The variant option
   */
exports.checkSelectionOption = (selection) => {
  switch (selection) {
    case "":
      return null;
    default:
      return shopify.options.selection;
  }
};


