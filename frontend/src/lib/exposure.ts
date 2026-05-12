import type { WalkPoint, BreathLoad, ActivityPreset } from '../types';
import { haversineKm } from './geo';

export function calcBreathLoad(
  points: WalkPoint[],
  activity: ActivityPreset,
  endTime: number,
  startTime: number
): BreathLoad {
  if (points.length === 0) {
    return {
      durationMin: 0, distanceKm: 0, avgAqi: 0, avgPm25: 0,
      airInhaledM3: 0, pm25InhaledUg: 0, worstPoint: null,
      cleanSavingsPct: 0, activity,
    };
  }

  const durationMin = (endTime - startTime) / 60000;
  const distanceKm = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    return acc + haversineKm(points[i - 1].lat, points[i - 1].lon, p.lat, p.lon);
  }, 0);

  const avgAqi = points.reduce((s, p) => s + p.aqi, 0) / points.length;
  const avgPm25 = points.reduce((s, p) => s + p.pm25, 0) / points.length;

  const airInhaledM3 = (activity.breathingRateLPerMin * durationMin) / 1000;
  const pm25InhaledUg = avgPm25 * airInhaledM3;

  const worstPoint = points.reduce((w, p) => (p.aqi > w.aqi ? p : w), points[0]);

  const sorted = [...points].sort((a, b) => a.pm25 - b.pm25);
  const cleanSlice = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.1)));
  const cleanAvgPm25 = cleanSlice.reduce((s, p) => s + p.pm25, 0) / cleanSlice.length;
  const cleanSavingsPct = avgPm25 > 0 ? Math.max(0, ((avgPm25 - cleanAvgPm25) / avgPm25) * 100) : 0;

  return { durationMin, distanceKm, avgAqi, avgPm25, airInhaledM3, pm25InhaledUg, worstPoint, cleanSavingsPct, activity };
}

export function liveBreathLoad(
  points: WalkPoint[],
  elapsedMin: number,
  breathingRateLPerMin: number
): { airInhaledM3: number; pm25InhaledUg: number } {
  const avgPm25 = points.length ? points.reduce((s, p) => s + p.pm25, 0) / points.length : 0;
  const airInhaledM3 = (breathingRateLPerMin * elapsedMin) / 1000;
  return { airInhaledM3, pm25InhaledUg: avgPm25 * airInhaledM3 };
}

export function storeCrowdPoint(point: { lat: number; lon: number; aqi: number }) {
  const key = 'urbanbreath_crowd';
  const existing: typeof point[] = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push(point);
  localStorage.setItem(key, JSON.stringify(existing.slice(-5000)));
}

export function loadCrowdPoints(): { lat: number; lon: number; aqi: number }[] {
  return JSON.parse(localStorage.getItem('urbanbreath_crowd') || '[]');
}
