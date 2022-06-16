/**
   * Find duplicate values in array.
   * @param {array} currentValue The array to check
   * @param {string} nextValue The string to check
   * @return {boolean} Whether duplicates were found or not
   */
exports.isNextDuplicate = (currentValue, nextValue) => {
  if (currentValue === nextValue) {
    return true;
  } else {
    return false;
  }
};


