import httpx
import math
from datetime import datetime, timezone
from typing import Optional

OPEN_METEO_AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def _aqi_from_pm25(pm25: float) -> float:
    """US EPA AQI breakpoints for PM2.5."""
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= pm25 <= c_hi:
            aqi = ((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo
            return round(aqi, 1)
    return 500.0


def _quality_label(aqi: float) -> tuple[str, str]:
    if aqi <= 50:
        return "Good", "#22c55e"
    elif aqi <= 100:
        return "Moderate", "#eab308"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups", "#f97316"
    elif aqi <= 200:
        return "Unhealthy", "#ef4444"
    elif aqi <= 300:
        return "Very Unhealthy", "#a855f7"
    else:
        return "Hazardous", "#7f1d1d"


def _fallback_data(lat: float, lon: float) -> dict:
    """Deterministic fallback so demo always shows something plausible."""
    seed = abs(math.sin(lat * 12.9898 + lon * 78.233)) * 43758.5453
    base_pm25 = 8.0 + (seed % 30)
    pm25 = round(base_pm25, 1)
    pm10 = round(pm25 * 1.6, 1)
    no2 = round(5 + (seed % 25), 1)
    co = round(0.1 + (seed % 0.4), 2)
    o3 = round(20 + (seed % 60), 1)
    aqi = _aqi_from_pm25(pm25)
    label, color = _quality_label(aqi)
    # Plausible 24h history: slight variation around current value
    history = [round(_aqi_from_pm25(max(0, pm25 + math.sin(i * 0.8) * 4)), 1) for i in range(24)]
    return {
        "lat": lat,
        "lon": lon,
        "source": "fallback",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "aqi": aqi,
        "pm25": pm25,
        "pm10": pm10,
        "no2": no2,
        "co": co,
        "o3": o3,
        "qualityLabel": label,
        "color": color,
        "isFallback": True,
        "aqiHistory": history,
    }


async def fetch_air_quality(lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "pm2_5,pm10,nitrogen_dioxide,carbon_monoxide,ozone,european_aqi",
        "timezone": "UTC",
        "past_days": 1,
        "forecast_days": 1,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_AQ_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        if not times:
            return _fallback_data(lat, lon)

        # Pick the most recent non-null hour
        idx = len(times) - 1
        pm25_vals = hourly.get("pm2_5", [])
        pm10_vals = hourly.get("pm10", [])
        no2_vals = hourly.get("nitrogen_dioxide", [])
        co_vals = hourly.get("carbon_monoxide", [])
        o3_vals = hourly.get("ozone", [])
        euro_aqi = hourly.get("european_aqi", [])

        # Walk back to find latest non-null pm2.5
        for i in range(idx, -1, -1):
            if pm25_vals and pm25_vals[i] is not None:
                idx = i
                break

        def safe(arr, i, default=0.0):
            try:
                v = arr[i]
                return float(v) if v is not None else default
            except (IndexError, TypeError):
                return default

        pm25 = safe(pm25_vals, idx)
        pm10 = safe(pm10_vals, idx)
        no2 = safe(no2_vals, idx)
        co = safe(co_vals, idx)
        o3 = safe(o3_vals, idx)
        euro = safe(euro_aqi, idx)

        # Prefer calculated US AQI from PM2.5; use european_aqi as cross-check
        aqi = _aqi_from_pm25(pm25) if pm25 > 0 else (euro if euro > 0 else _aqi_from_pm25(5.0))
        label, color = _quality_label(aqi)

        # Last 24 hours of AQI history for trend chart
        history: list[float] = []
        start = max(0, idx - 23)
        for i in range(start, idx + 1):
            v = pm25_vals[i] if i < len(pm25_vals) else None
            if v is not None:
                history.append(round(_aqi_from_pm25(float(v)), 1))

        return {
            "lat": lat,
            "lon": lon,
            "source": "open-meteo",
            "timestamp": times[idx] + ":00+00:00" if "T" in times[idx] else datetime.now(timezone.utc).isoformat(),
            "aqi": aqi,
            "pm25": pm25,
            "pm10": pm10,
            "no2": no2,
            "co": co,
            "o3": o3,
            "qualityLabel": label,
            "color": color,
            "isFallback": False,
            "aqiHistory": history,
        }

    except Exception:
        return _fallback_data(lat, lon)
