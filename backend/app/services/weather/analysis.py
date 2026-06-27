# Maharashtra district normal annual rainfall reference (IMD data)
DISTRICT_NORMAL_RAINFALL_MM = {
    "Pune": 722, "Nashik": 681, "Kolhapur": 1672, "Satara": 1050,
    "Solapur": 553, "Aurangabad": 657, "Nagpur": 1034, "Amravati": 848,
    "Thane": 2420, "Palghar": 2500, "Raigad": 3000, "Ratnagiri": 3200,
    "Sindhudurg": 3300, "Nandurbar": 2500, "Dhule": 800, "Jalgaon": 700,
    "Ahmednagar": 600, "Beed": 550, "Latur": 600, "Osmanabad": 800,
    "Nanded": 800, "Parbhani": 900, "Hingoli": 850, "Jalna": 750,
    "Buldhana": 750, "Akola": 800, "Washim": 800, "Yavatmal": 900,
    "Wardha": 1000, "Bhandara": 1000, "Gondia": 1200, "Chandrapur": 1100,
    "Gadchiroli": 1200, "Mumbai": 2400, "Mumbai Suburban": 2400
}


def assess_rainfall_adequacy(annual_rainfall_mm: float, district: str) -> dict:
    """
    Compare against IMD district normal.
    Returns: {adequacy: "deficit"|"normal"|"surplus", percent_of_normal: float, deviation_mm: float}
    """
    normal = DISTRICT_NORMAL_RAINFALL_MM.get(
        district, 1000.0)  # Fallback 1000mm
    percent_of_normal = (annual_rainfall_mm / normal) * 100.0
    deviation_mm = annual_rainfall_mm - normal

    if percent_of_normal < 80:
        adequacy = "deficit"
    elif percent_of_normal > 120:
        adequacy = "surplus"
    else:
        adequacy = "normal"

    return {
        "adequacy": adequacy,
        "percent_of_normal": percent_of_normal,
        "deviation_mm": deviation_mm
    }


def calculate_heat_index(temp_c: float, humidity_percent: float) -> float:
    """
    Steadman heat index formula (Simplified approximation in Celsius for general range).
    Accurate Steadman formula requires Fahrenheit.
    """
    # Convert to Fahrenheit
    t = (temp_c * 9 / 5) + 32
    rh = humidity_percent

    # Simple unadjusted Heat Index
    hi = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094))

    if hi >= 80:
        # Full Rothfusz regression
        hi = -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh \
             - 0.00683783 * t * t - 0.05481717 * rh * rh + 0.00122874 * t * t * rh \
            + 0.00085282 * t * rh * rh - 0.00000199 * t * t * rh * rh

        if rh < 13 and 80 <= t <= 112:
            adj = ((13 - rh) / 4) * ((17 - abs(t - 95.)) / 17) ** 0.5
            hi -= adj
        elif rh > 85 and 80 <= t <= 87:
            adj = ((rh - 85) / 10) * ((87 - t) / 5)
            hi += adj

    # Convert back to Celsius
    hi_c = (hi - 32) * 5 / 9
    return hi_c


def assess_heat_stress(temp_c: float, humidity_percent: float) -> dict:
    """
    Returns: {heat_index_c, risk_level: "low"|"moderate"|"high"|"extreme", affected_crops: list[str]}
    """
    hi_c = calculate_heat_index(temp_c, humidity_percent)

    affected_crops = []

    if hi_c < 27:
        risk_level = "low"
    elif hi_c < 32:
        risk_level = "moderate"
        affected_crops = ["Wheat (at filling stage)", "Leafy Greens"]
    elif hi_c < 41:
        risk_level = "high"
        affected_crops = ["Wheat", "Soybean", "Maize", "Vegetables"]
    else:
        risk_level = "extreme"
        affected_crops = [
            "Most open-field crops",
            "Orchards without canopy cover"]

    return {
        "heat_index_c": hi_c,
        "risk_level": risk_level,
        "affected_crops": affected_crops
    }


def assess_drought_risk(
        annual_rainfall_mm: float,
        ndvi: float,
        district: str) -> dict:
    """
    Combined: rainfall deficit + vegetation stress.
    Returns: {risk_level, explanation}
    """
    adequacy = assess_rainfall_adequacy(annual_rainfall_mm, district)
    percent = adequacy["percent_of_normal"]

    # Drought risk matrix
    # High risk: <60% rainfall OR (<80% rainfall AND ndvi < 0.3)
    # Moderate risk: <80% rainfall OR (<100% rainfall AND ndvi < 0.4)
    # Low risk: Otherwise

    if percent < 60 or (percent < 80 and ndvi < 0.3):
        risk_level = "high"
        explanation = "High risk due to severe rainfall deficit coupled with low vegetation health."
    elif percent < 80 or (percent < 100 and ndvi < 0.4):
        risk_level = "moderate"
        explanation = "Moderate risk due to below-normal rainfall and emerging vegetation stress."
    else:
        risk_level = "low"
        explanation = "Low drought risk; rainfall and vegetation appear stable."

    return {
        "risk_level": risk_level,
        "explanation": explanation
    }
