from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import AirQualityResponse, RouteScoreRequest, RouteScoreResponse
from services.air_quality import fetch_air_quality
from services.route_scoring import score_route

app = FastAPI(title="UrbanBreath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/air-quality", response_model=AirQualityResponse)
async def get_air_quality(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    data = await fetch_air_quality(lat, lon)
    return data


@app.post("/api/route-score", response_model=RouteScoreResponse)
async def post_route_score(req: RouteScoreRequest):
    if len(req.route) < 2:
        raise HTTPException(status_code=400, detail="Route must have at least 2 points")
    route_dicts = [{"lat": p.lat, "lon": p.lon} for p in req.route]
    result = await score_route(route_dicts, req.walkingSpeedKmph)
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
