const {bs} = require("../config/config");

/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} gender The BS gneder designation
   * @return {string} converted gender
   */
exports.convertGender = (gender) => {
  switch (gender) {
    case bs.gender.male:
      return "male";
    case bs.gender.female:
      return "female";
    case bs.gender.unisex:
      return "unisex";
    default:
      return "";
  }
};


