const {bs, shopify} = require("../config/config");

/**
   * Transforms BS measurements designation into standard measurements designation
   * @param {string} unitOfMeasurement The BS units of measurements
   * @return {string} The standard measurements
   *
   */
exports.convertUnitOfMeasurement = (unitOfMeasurement) => {
  switch (unitOfMeasurement) {
    case bs.unitOfMeasurement.ml:
    case bs.unitOfMeasurement.bottle:
    case bs.unitOfMeasurement.liter:
      return shopify.options.unitOfMeasurement.ml;
    case bs.unitOfMeasurement.gram:
      return shopify.options.unitOfMeasurement.gram;
    case bs.unitOfMeasurement.piece:
      return shopify.options.unitOfMeasurement.piece;
    default:
      return "";
  }
};
