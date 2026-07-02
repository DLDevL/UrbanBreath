export function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#7f1d1d';
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function aqiBgClass(aqi: number): string {
  if (aqi <= 50) return 'bg-green-500/20 border-green-500/40 text-green-400';
  if (aqi <= 100) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
  if (aqi <= 150) return 'bg-orange-500/20 border-orange-500/40 text-orange-400';
  if (aqi <= 200) return 'bg-red-500/20 border-red-500/40 text-red-400';
  if (aqi <= 300) return 'bg-purple-500/20 border-purple-500/40 text-purple-400';
  return 'bg-red-900/40 border-red-900/60 text-red-300';
}

export function aqiGuidance(aqi: number): string {
  if (aqi <= 50) return 'Great time for a walk. Air quality is excellent.';
  if (aqi <= 100) return 'Fine for most people. Sensitive users should limit prolonged outdoor exposure.';
  if (aqi <= 150) return 'Sensitive groups (asthma, heart conditions) should reduce outdoor time.';
  if (aqi <= 200) return 'Consider a cleaner route or shorter outdoor time. Wear a mask if possible.';
  if (aqi <= 300) return 'Avoid prolonged outdoor exertion. Stay indoors when possible.';
  return 'Health emergency conditions. Avoid all outdoor activity.';
}

export function pm25Dose(avgPm25Ug_m3: number, durationMin: number, breathingRateLPerMin = 20): {
  airInhaledM3: number;
  pm25InhaledUg: number;
} {
  const airInhaledM3 = (breathingRateLPerMin * durationMin) / 1000;
  const pm25InhaledUg = avgPm25Ug_m3 * airInhaledM3;
  return { airInhaledM3, pm25InhaledUg };
}
