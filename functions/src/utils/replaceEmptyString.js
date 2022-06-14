/**
   * Replace empty strings with ''.
   * @param {string} string The string to check
   * @return {string} converted color
   */
exports.replaceEmptyString = (string) => {
  switch (string) {
    case "":
      return "''";
    default:
      return string;
  }
};


