from pydantic import BaseModel
from typing import Optional, List


class AirQualityResponse(BaseModel):
    lat: float
    lon: float
    source: str
    timestamp: str
    aqi: float
    pm25: float
    pm10: float
    no2: float
    co: float
    o3: float
    qualityLabel: str
    color: str
    isFallback: bool = False


class RoutePoint(BaseModel):
    lat: float
    lon: float


class RouteScoreRequest(BaseModel):
    route: List[RoutePoint]
    walkingSpeedKmph: float = 4.8


class RouteSegment(BaseModel):
    startLat: float
    startLon: float
    endLat: float
    endLon: float
    distanceKm: float
    durationMin: float
    aqi: float
    pm25: float
    color: str
    exposure: float


class RouteScoreResponse(BaseModel):
    averageAqi: float
    averagePm25: float
    routeExposure: float
    totalDistanceKm: float
    totalDurationMin: float
    cleanlinessScore: float
    worstPoint: RoutePoint
    worstAqi: float
    segments: List[RouteSegment]
    isFallback: bool = False
