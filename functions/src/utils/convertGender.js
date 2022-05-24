const {bs} = require("../config/config");

/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} gender The BS gneder designation
   */
exports.convertGender = (gender) => {
  switch (gender) {
    case bs.gender.male:
      "male";
      break;
    case bs.gender.female:
      "female";
      break;
    case bs.gender.unisex:
      "unisex";
      break;
    default:
      "";
      break;
  }
};


