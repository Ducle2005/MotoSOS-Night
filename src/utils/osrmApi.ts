import type { GeoCoord, GeoJsonLineString } from '../types/rescue';
import { computeHaversineMeters, estimateWalkingMinutes } from './rescueLogic';

export interface RouteFetchResult {
  geometry: GeoJsonLineString;
  distanceMeters: number;
  durationMinutes: number;
  source: 'osrm' | 'fallback';
}

const routeMemoryCache = new Map<string, RouteFetchResult>();

function getRouteFromCache(key: string): RouteFetchResult | null {
  const inMem = routeMemoryCache.get(key);
  if (inMem) return inMem;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(`ms_rt_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw) as RouteFetchResult;
        routeMemoryCache.set(key, parsed);
        return parsed;
      }
    }
  } catch {}
  return null;
}

function saveRouteToCache(key: string, data: RouteFetchResult): void {
  routeMemoryCache.set(key, data);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`ms_rt_${key}`, JSON.stringify(data));
    }
  } catch {}
}

export function buildInterpolatedFallbackRoute(
  fromCoord: GeoCoord,
  toCoord: GeoCoord,
  segments = 12,
): GeoJsonLineString {
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const arcOffset = Math.sin(t * Math.PI) * 0.00055;
    coordinates.push([
      fromCoord.lng + (toCoord.lng - fromCoord.lng) * t - arcOffset,
      fromCoord.lat + (toCoord.lat - fromCoord.lat) * t + arcOffset * 0.6,
    ]);
  }
  return { type: 'LineString', coordinates };
}

export async function fetchWalkingRoute(
  fromCoord: GeoCoord,
  toCoord: GeoCoord,
  signal?: AbortSignal,
): Promise<RouteFetchResult> {
  const cacheKey = `w_${fromCoord.lat.toFixed(4)},${fromCoord.lng.toFixed(4)}_${toCoord.lat.toFixed(4)},${toCoord.lng.toFixed(4)}`;
  const cached = getRouteFromCache(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/foot/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson`;

  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 3500);
    const combinedSignal = signal ? AbortSignal.any([signal, ctrl.signal]) : ctrl.signal;

    const response = await fetch(url, { signal: combinedSignal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as {
        routes?: Array<{ geometry?: GeoJsonLineString; distance?: number }>;
      };
      const firstRoute = data.routes?.[0];
      if (
        firstRoute?.geometry?.type === 'LineString' &&
        Array.isArray(firstRoute.geometry.coordinates) &&
        firstRoute.geometry.coordinates.length >= 2
      ) {
        const dist = Math.round(firstRoute.distance ?? 0);
        const res: RouteFetchResult = {
          geometry: firstRoute.geometry,
          distanceMeters: dist,
          durationMinutes: estimateWalkingMinutes(dist),
          source: 'osrm',
        };
        saveRouteToCache(cacheKey, res);
        return res;
      }
    }
  } catch {}

  const fallbackDist = computeHaversineMeters(fromCoord, toCoord);
  const fallbackRes: RouteFetchResult = {
    geometry: {
      type: 'LineString',
      coordinates: [[fromCoord.lng, fromCoord.lat], [toCoord.lng, toCoord.lat]],
    },
    distanceMeters: fallbackDist,
    durationMinutes: estimateWalkingMinutes(fallbackDist),
    source: 'fallback',
  };
  saveRouteToCache(cacheKey, fallbackRes);
  return fallbackRes;
}

export async function fetchMechanicDrivingRoute(
  fromCoord: GeoCoord,
  toCoord: GeoCoord,
  signal?: AbortSignal,
): Promise<RouteFetchResult> {
  const cacheKey = `d_${fromCoord.lat.toFixed(4)},${fromCoord.lng.toFixed(4)}_${toCoord.lat.toFixed(4)},${toCoord.lng.toFixed(4)}`;
  const cached = getRouteFromCache(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson`;

  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 3500);
    const combinedSignal = signal ? AbortSignal.any([signal, ctrl.signal]) : ctrl.signal;

    const response = await fetch(url, { signal: combinedSignal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as {
        routes?: Array<{
          geometry?: GeoJsonLineString;
          distance?: number;
          duration?: number;
        }>;
      };
      const firstRoute = data.routes?.[0];
      if (
        firstRoute?.geometry?.type === 'LineString' &&
        Array.isArray(firstRoute.geometry.coordinates) &&
        firstRoute.geometry.coordinates.length >= 2
      ) {
        const dist = Math.round(firstRoute.distance ?? 1300);
        const mins = Math.max(2, Math.round((firstRoute.duration ?? 300) / 60));
        const res: RouteFetchResult = {
          geometry: firstRoute.geometry,
          distanceMeters: dist,
          durationMinutes: mins,
          source: 'osrm',
        };
        saveRouteToCache(cacheKey, res);
        return res;
      }
    }
  } catch {}

  const fallbackDist = computeHaversineMeters(fromCoord, toCoord);
  const fallbackRes: RouteFetchResult = {
    geometry: buildInterpolatedFallbackRoute(fromCoord, toCoord, 14),
    distanceMeters: fallbackDist,
    durationMinutes: Math.max(3, Math.round(fallbackDist / 260)),
    source: 'fallback',
  };
  saveRouteToCache(cacheKey, fallbackRes);
  return fallbackRes;
}
