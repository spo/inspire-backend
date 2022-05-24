/**
   * Calculates the initial selling price
   * @param {number} purchasePrice The purchase price
   * @return {number} The selling price
   */
exports.calculateInitialSellingPrice = (purchasePrice) => {
  const sellingPrice = purchasePrice*2.5;
  return sellingPrice;
};
