export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function totalDistanceKm(points: { lat: number; lon: number }[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += haversineKm(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
  }
  return d;
}

/** Build an NxN grid of lat/lon points centred on origin, spaced `stepDeg` degrees apart. */
export function buildGrid(
  lat: number,
  lon: number,
  n: number,
  stepDeg: number
): { lat: number; lon: number }[] {
  const half = Math.floor(n / 2);
  const pts: { lat: number; lon: number }[] = [];
  for (let row = -half; row <= half; row++) {
    for (let col = -half; col <= half; col++) {
      pts.push({ lat: lat + row * stepDeg, lon: lon + col * stepDeg });
    }
  }
  return pts;
}
