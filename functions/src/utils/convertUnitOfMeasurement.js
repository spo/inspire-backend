const {bs} = require("../config/config");

/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} unitOfMeasurement The BS units of measurements
   *
   */
exports.convertUnitOfMeasurement = (unitOfMeasurement) => {
  switch (unitOfMeasurement) {
    case bs.unitOfMeasurement.ml:
    case bs.unitOfMeasurement.bottle:
    case bs.unitOfMeasurement.liter:
      "ml";
      break;
    case bs.unitOfMeasurement.gram:
      "g";
      break;
    case bs.unitOfMeasurement.piece:
      "Stück";
      break;
    default:
      "";
      break;
  }
};
