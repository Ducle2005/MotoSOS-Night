import type { GeoCoord } from '../types/rescue';

export interface GpsFix {
  coord: GeoCoord;
  accuracyMeters: number;
}

export const HIGH_ACCURACY_GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export function pickBetterGpsSample(
  best: GpsFix | null,
  candidate: GpsFix,
): GpsFix {
  if (!best) return candidate;
  return candidate.accuracyMeters < best.accuracyMeters ? candidate : best;
}

export function formatGpsAccuracyBadge(
  accuracyMeters: number | null | undefined,
): string | null {
  if (typeof accuracyMeters !== 'number' || !Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    return null;
  }
  return `Độ chính xác GPS: ±${Math.round(accuracyMeters)}m`;
}

export interface GeoJsonPolygonCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, never>;
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
  }>;
}

export function buildAccuracyCirclePolygon(
  center: GeoCoord,
  radiusMeters: number,
  steps = 48,
): GeoJsonPolygonCollection {
  const safeRadius = Math.min(Math.max(radiusMeters, 5), 1500);
  const earthRadiusMeters = 6378137;
  const latRad = (center.lat * Math.PI) / 180;
  const ring: [number, number][] = [];

  for (let i = 0; i <= steps; i += 1) {
    const bearing = (i / steps) * 2 * Math.PI;
    const dLat = (safeRadius / earthRadiusMeters) * Math.cos(bearing);
    const dLng =
      (safeRadius / (earthRadiusMeters * Math.max(Math.cos(latRad), 0.01))) *
      Math.sin(bearing);
    ring.push([
      center.lng + (dLng * 180) / Math.PI,
      center.lat + (dLat * 180) / Math.PI,
    ]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
      },
    ],
  };
}

export function watchBestGpsPosition(
  maxWaitMs = 2500,
  targetAccuracyMeters = 20,
): Promise<GpsFix | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    let bestFix: GpsFix | null = null;
    let settled = false;
    let watchId: number | null = null;
    let windowTimer: number | null = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (windowTimer !== null) window.clearTimeout(windowTimer);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      resolve(bestFix);
    };

    windowTimer = window.setTimeout(finish, maxWaitMs);

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const rawAccuracy = pos.coords.accuracy;
          const accuracyMeters =
            typeof rawAccuracy === 'number' && Number.isFinite(rawAccuracy) && rawAccuracy > 0
              ? Math.round(rawAccuracy)
              : 50;

          bestFix = pickBetterGpsSample(bestFix, {
            coord: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            accuracyMeters,
          });

          if (accuracyMeters <= targetAccuracyMeters) {
            finish();
          }
        },
        () => {
          finish();
        },
        HIGH_ACCURACY_GPS_OPTIONS,
      );
    } catch {
      finish();
    }
  });
}
