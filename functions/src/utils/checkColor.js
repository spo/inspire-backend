/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} color The BS color
   * @return {string} converted color
   */
exports.checkColor = (color) => {
  switch (color) {
    case "-":
      return "";
    default:
      return color;
  }
};


