import type { AirQualityData } from '../types';

const BASE = '/api';

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const res = await fetch(`${BASE}/air-quality?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);
  return res.json();
}
