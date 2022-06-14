/**
   * Convert a number to string and remove insignificant trailing zeros and replace dot with comma
   * Example:
   * 0.0000 -> 0
   * 0.0001 -> 0,0001
   * 7.5 -> 7,5
   * 750 -> 750
   *
   * @param {number} number The purchase price
   * @return {number} The selling price
   */
exports.convertNumberToStringWithComma = (number) => {
  const noZeroes = number.toString();
  const noZeroesWithComma = noZeroes.replace(".", ",");
  return noZeroesWithComma;
};
