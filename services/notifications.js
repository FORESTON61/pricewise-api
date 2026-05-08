module.exports = async (
  supabase,
  productSlug,
  currentPrice
) => {

  try {

    // =========================
    // GET ALERTS
    // =========================

    const {
      data: alerts,
      error
    } =
      await supabase
        .from("alerts")
        .select("*")
        .eq(
          "product_slug",
          productSlug
        )
        .eq(
          "is_active",
          true
        );

    if (
      error ||
      !alerts
    ) {

      return [];

    }

    // =========================
    // TRIGGER ALERTS
    // =========================

    const triggeredAlerts =
      [];

    alerts.forEach(alert => {

      if (
        currentPrice <=
        alert.target_price
      ) {

        triggeredAlerts.push({

          userId:
            alert.user_id,

          productSlug,

          targetPrice:
            alert.target_price,

          currentPrice,

          message:
            "Target price reached"

        });

      }

    });

    return triggeredAlerts;

  } catch (error) {

    return [];

  }

};
