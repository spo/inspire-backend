/**
   * Wait for a given time
   * @param {number} ms How many milliseconds to wait
   * @return {Promise} The promise when timer has expired
   */
exports.wait = (ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


