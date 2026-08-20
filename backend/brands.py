BRAND_MAP = {
    "haircare": {
        "brand": "SUNSILK",
        "reason": "Strong fit with everyday hair-care needs and emerging frizz or damage conversations.",
    },
    "deodorant": {
        "brand": "REXONA",
        "reason": "Direct alignment with sweat management, movement and confidence moments.",
    },
    "skincare": {
        "brand": "POND'S",
        "reason": "Strong fit with mass-premium facial skincare and digital beauty discovery.",
    },
}


def recommend_brand(category: str):
    category = (category or "").lower().strip()
    return BRAND_MAP.get(
        category,
        {
            "brand": "HUL BRAND",
            "reason": "Requires portfolio-level relevance scoring.",
        },
    )
