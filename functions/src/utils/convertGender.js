const {bs, shopify} = require("../config/config");

/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} gender The BS gneder designation
   * @return {string} converted gender
   */
exports.convertGender = (gender) => {
  switch (gender) {
    case bs.gender.male:
      return shopify.options.gender.male;
    case bs.gender.female:
      return shopify.options.gender.female;
    case bs.gender.unisex:
      return shopify.options.gender.unisex;
    default:
      return "";
  }
};


