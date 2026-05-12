export interface AirQualityData {
  lat: number;
  lon: number;
  source: string;
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  o3: number;
  qualityLabel: string;
  color: string;
  isFallback: boolean;
  aqiHistory?: number[];
}

export interface AqiGridPoint {
  lat: number;
  lon: number;
  aqi: number;
  color: string;
}

export interface WalkPoint {
  lat: number;
  lon: number;
  timestamp: number;
  aqi: number;
  pm25: number;
  color: string;
}

export interface WalkSession {
  id: string;
  startTime: number;
  endTime?: number;
  points: WalkPoint[];
  breathLoad?: BreathLoad;
  activity: ActivityPreset;
}

export interface BreathLoad {
  durationMin: number;
  distanceKm: number;
  avgAqi: number;
  avgPm25: number;
  avgNo2?: number;
  airInhaledM3: number;
  pm25InhaledUg: number;
  worstPoint: WalkPoint | null;
  cleanSavingsPct: number;
  activity: ActivityPreset;
}

export interface ActivityPreset {
  id: string;
  label: string;
  icon: string;
  breathingRateLPerMin: number;
}

export interface Settings {
  aqiUnit: 'us' | 'eu';
}

export type AppScreen = 'map' | 'walk' | 'summary' | 'settings';
