# UrbanBreath

Mobile-first air-quality walking app. See live AQI gradients, plan cleaner routes, track your pollution exposure, and review your estimated Breath Load after every walk.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — allow location access when prompted.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4 + Leaflet
- **Backend**: FastAPI + httpx
- **Air Quality**: Open-Meteo Air Quality API (real data, no key needed)
- **Routing**: Straight-line fallback (ORS optional via `ORS_API_KEY`)

## Features

- Live AQI map with colored gradient around your location
- Clean-air route planner with per-segment AQI coloring
- Walk tracker with GPS polling every 8s
- Breath Load calculator (estimated PM2.5 inhaled)
- Walk summary with health insights
- Crowd heatmap from anonymous walk data (localStorage)
- Settings: breathing rate, AQI unit

## Notes

- All exposure values are **estimates** based on modelled data and typical breathing rates.
- Crowd data never leaves your device.
- Fallback/demo mode activates automatically if the API is unreachable.
