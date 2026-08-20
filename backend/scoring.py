def calculate_opportunity_score(
    scores
):

    return round(

        (
            scores["trend_velocity"] * 0.25
            + scores["brand_relevance"] * 0.30
            + scores["consumer_fit"] * 0.25
            + scores["sentiment"] * 0.10
            + scores["time_sensitivity"] * 0.10
        ),

        1
    )