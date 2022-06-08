/**
   * Transforms BS gender designation into standard gender designation
   * @param {string} selection The BS color
   * @return {string} converted color
   */
exports.checkSelection = (selection) => {
  switch (selection) {
    case "":
      return null;
    default:
      return selection;
  }
};


