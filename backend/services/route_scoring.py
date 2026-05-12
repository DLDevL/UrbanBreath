import asyncio
import math
from typing import List

from services.air_quality import fetch_air_quality


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


async def score_route(route: List[dict], walking_speed_kmph: float = 4.8) -> dict:
    if len(route) < 2:
        return {}

    # Fetch AQ for each point concurrently (capped at 12 samples to stay within limits)
    sample_indices = _sample_indices(len(route), max_samples=12)
    sampled = [route[i] for i in sample_indices]

    tasks = [fetch_air_quality(p["lat"], p["lon"]) for p in sampled]
    aq_results = await asyncio.gather(*tasks)

    # Build a lookup: index -> AQ data
    aq_map = {sample_indices[i]: aq_results[i] for i in range(len(sample_indices))}

    # Interpolate AQ for non-sampled points
    def interpolate_aq(idx: int):
        lower = max((k for k in aq_map if k <= idx), default=None)
        upper = min((k for k in aq_map if k >= idx), default=None)
        if lower is None:
            return aq_map[upper]
        if upper is None:
            return aq_map[lower]
        if lower == upper:
            return aq_map[lower]
        t = (idx - lower) / (upper - lower)
        lo = aq_map[lower]
        hi = aq_map[upper]
        pm25 = lo["pm25"] + t * (hi["pm25"] - lo["pm25"])
        aqi = lo["aqi"] + t * (hi["aqi"] - lo["aqi"])
        return {**lo, "pm25": pm25, "aqi": aqi}

    segments = []
    total_exposure = 0.0
    total_aqi = 0.0
    total_pm25 = 0.0
    total_dist = 0.0
    worst_aqi = 0.0
    worst_point = route[0]
    any_fallback = any(r.get("isFallback") for r in aq_results)

    for i in range(len(route) - 1):
        p1, p2 = route[i], route[i + 1]
        dist = _haversine_km(p1["lat"], p1["lon"], p2["lat"], p2["lon"])
        duration_min = (dist / walking_speed_kmph) * 60
        aq = interpolate_aq(i)

        pm25 = aq["pm25"]
        aqi = aq["aqi"]
        color = aq["color"]

        # Breath load for this segment
        breathing_rate = 20.0  # L/min walking
        air_m3 = breathing_rate * duration_min / 1000
        exposure = pm25 * air_m3

        total_exposure += exposure
        total_aqi += aqi
        total_pm25 += pm25
        total_dist += dist

        if aqi > worst_aqi:
            worst_aqi = aqi
            worst_point = {"lat": (p1["lat"] + p2["lat"]) / 2, "lon": (p1["lon"] + p2["lon"]) / 2}

        segments.append({
            "startLat": p1["lat"],
            "startLon": p1["lon"],
            "endLat": p2["lat"],
            "endLon": p2["lon"],
            "distanceKm": round(dist, 4),
            "durationMin": round(duration_min, 2),
            "aqi": round(aqi, 1),
            "pm25": round(pm25, 2),
            "color": color,
            "exposure": round(exposure, 4),
        })

    n = len(segments)
    avg_aqi = total_aqi / n if n else 0
    avg_pm25 = total_pm25 / n if n else 0
    total_duration = (total_dist / walking_speed_kmph) * 60

    # Cleanliness score: 0–100, higher = cleaner (inverted AQI scale)
    cleanliness = max(0.0, min(100.0, 100 - (avg_aqi / 5)))

    return {
        "averageAqi": round(avg_aqi, 1),
        "averagePm25": round(avg_pm25, 2),
        "routeExposure": round(total_exposure, 4),
        "totalDistanceKm": round(total_dist, 3),
        "totalDurationMin": round(total_duration, 1),
        "cleanlinessScore": round(cleanliness, 1),
        "worstPoint": worst_point,
        "worstAqi": round(worst_aqi, 1),
        "segments": segments,
        "isFallback": any_fallback,
    }


def _sample_indices(n: int, max_samples: int) -> List[int]:
    if n <= max_samples:
        return list(range(n))
    step = (n - 1) / (max_samples - 1)
    return sorted(set(round(i * step) for i in range(max_samples)))
