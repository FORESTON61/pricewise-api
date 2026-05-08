module.exports = {

  // =========================
  // PRODUCT SLUG
  // =========================

  createSlug(product) {

    return product
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  },

  // =========================
  // PRICE DIFFERENCE %
  // =========================

  calculateDifferencePercent(
    currentPrice,
    lowestPrice
  ) {

    return (
      (
        (
          currentPrice -
          lowestPrice
        ) / lowestPrice
      ) * 100
    ).toFixed(2);

  },

  // =========================
  // VALID PRICE
  // =========================

  isValidPrice(price) {

    return (
      !isNaN(price) &&
      price >= 1000
    );

  }

};
