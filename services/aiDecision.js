module.exports = (
  currentPrice,
  lowestPrice,
  history
) => {

  try {

    let trend =
      "stable";

    // =========================
    // TREND ANALYSIS
    // =========================

    if (
      history &&
      history.length >= 2
    ) {

      const latest =
        history[
          history.length - 1
        ];

      const previous =
        history[
          history.length - 2
        ];

      if (latest > previous) {
        trend = "spike_up";
      }

      if (latest < previous) {
        trend = "drop";
      }

    }

    // =========================
    // DIFFERENCE %
    // =========================

    const differencePercent =
      (
        (
          (
            currentPrice -
            lowestPrice
          ) / lowestPrice
        ) * 100
      ).toFixed(2);

    // =========================
    // DEFAULT RESPONSE
    // =========================

    let decision =
      "WAIT";

    let confidence =
      70;

    let reason =
      "No strong signal yet";

    // =========================
    // PRICE SPIKE
    // =========================

    if (
      trend === "spike_up"
    ) {

      decision =
        "AVOID";

      confidence =
        85;

      reason =
        "Recent sudden price spike";

    }

    // =========================
    // GOOD BUY RANGE
    // =========================

    if (
      differencePercent < 5
    ) {

      decision =
        "BUY";

      confidence =
        90;

      reason =
        "Price near historical low";

    }

    return {

      trend,

      differencePercent,

      decision,

      confidence,

      reason

    };

  } catch (error) {

    return {

      trend:
        "unknown",

      differencePercent:
        0,

      decision:
        "WAIT",

      confidence:
        50,

      reason:
        error.message

    };

  }

};
