import type { GeoCoord, GeoJsonLineString } from '../types/rescue';
import { computeHaversineMeters, estimateWalkingMinutes } from './rescueLogic';

export interface OSRMStep {
  name?: string; distance?: number; duration?: number;
  maneuver?: { type?: string; modifier?: string };
}

export interface RouteFetchResult {
  geometry: GeoJsonLineString;
  distanceMeters: number;
  durationMinutes: number;
  source: 'osrm' | 'fallback';
  firstStepInstruction?: string;
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

export function formatFirstStepInstruction(steps?: OSRMStep[], fallbackMeters = 0): string {
  if (!steps || steps.length === 0) {
    const dist = Math.round(fallbackMeters);
    return dist > 0 ? `Đi theo lộ trình khoảng ${dist}m` : 'Đi theo hướng dẫn lộ trình';
  }
  const step = steps.find((s) => (s.distance ?? 0) > 0) || steps[0];
  const dist = Math.round(step.distance ?? fallbackMeters);
  const name = step.name?.trim();
  const mod = step.maneuver?.modifier;
  const action = mod?.includes('left') ? 'Rẽ trái' : mod?.includes('right') ? 'Rẽ phải' : 'Đi thẳng';
  return name && name.length > 0 ? `${action} theo ${name} khoảng ${dist}m` : `${action} khoảng ${dist}m`;
}

export function buildInterpolatedFallbackRoute(fromCoord: GeoCoord, toCoord: GeoCoord, segments = 12): GeoJsonLineString {
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

async function requestOsrm(url: string, signal?: AbortSignal) {
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 3500);
  try {
    const combined = signal ? AbortSignal.any([signal, ctrl.signal]) : ctrl.signal;
    const res = await fetch(url, { signal: combined });
    clearTimeout(timeoutId);
    return res.ok ? await res.json() : null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function fetchWalkingRoute(fromCoord: GeoCoord, toCoord: GeoCoord, signal?: AbortSignal): Promise<RouteFetchResult> {
  const cacheKey = `w_${fromCoord.lat.toFixed(4)},${fromCoord.lng.toFixed(4)}_${toCoord.lat.toFixed(4)},${toCoord.lng.toFixed(4)}`;
  const cached = getRouteFromCache(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/foot/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson`;
  const data = await requestOsrm(url, signal);
  const firstRoute = data?.routes?.[0];

  if (firstRoute?.geometry?.type === 'LineString' && Array.isArray(firstRoute.geometry.coordinates) && firstRoute.geometry.coordinates.length >= 2) {
    const dist = Math.round(firstRoute.distance ?? 0);
    const res: RouteFetchResult = {
      geometry: firstRoute.geometry, distanceMeters: dist,
      durationMinutes: estimateWalkingMinutes(dist), source: 'osrm',
    };
    saveRouteToCache(cacheKey, res);
    return res;
  }

  const fallbackDist = computeHaversineMeters(fromCoord, toCoord);
  const fallbackRes: RouteFetchResult = {
    geometry: { type: 'LineString', coordinates: [[fromCoord.lng, fromCoord.lat], [toCoord.lng, toCoord.lat]] },
    distanceMeters: fallbackDist, durationMinutes: estimateWalkingMinutes(fallbackDist), source: 'fallback',
  };
  saveRouteToCache(cacheKey, fallbackRes);
  return fallbackRes;
}

export async function fetchMechanicDrivingRoute(fromCoord: GeoCoord, toCoord: GeoCoord, signal?: AbortSignal): Promise<RouteFetchResult> {
  const cacheKey = `d_${fromCoord.lat.toFixed(4)},${fromCoord.lng.toFixed(4)}_${toCoord.lat.toFixed(4)},${toCoord.lng.toFixed(4)}`;
  const cached = getRouteFromCache(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson`;
  const data = await requestOsrm(url, signal);
  const firstRoute = data?.routes?.[0];

  if (firstRoute?.geometry?.type === 'LineString' && Array.isArray(firstRoute.geometry.coordinates) && firstRoute.geometry.coordinates.length >= 2) {
    const dist = Math.round(firstRoute.distance ?? 1300);
    const res: RouteFetchResult = {
      geometry: firstRoute.geometry, distanceMeters: dist,
      durationMinutes: Math.max(2, Math.round((firstRoute.duration ?? 300) / 60)), source: 'osrm',
    };
    saveRouteToCache(cacheKey, res);
    return res;
  }

  const fallbackDist = computeHaversineMeters(fromCoord, toCoord);
  const fallbackRes: RouteFetchResult = {
    geometry: buildInterpolatedFallbackRoute(fromCoord, toCoord, 14),
    distanceMeters: fallbackDist, durationMinutes: Math.max(3, Math.round(fallbackDist / 260)), source: 'fallback',
  };
  saveRouteToCache(cacheKey, fallbackRes);
  return fallbackRes;
}

export async function fetchSafeHavenRoute(fromCoord: GeoCoord, toCoord: GeoCoord, signal?: AbortSignal): Promise<RouteFetchResult> {
  const cacheKey = `sh_${fromCoord.lat.toFixed(4)},${fromCoord.lng.toFixed(4)}_${toCoord.lat.toFixed(4)},${toCoord.lng.toFixed(4)}`;
  const cached = getRouteFromCache(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lng},${fromCoord.lat};${toCoord.lng},${toCoord.lat}?overview=full&geometries=geojson&steps=true`;
  const data = await requestOsrm(url, signal);
  const firstRoute = data?.routes?.[0];

  if (firstRoute?.geometry?.type === 'LineString' && Array.isArray(firstRoute.geometry.coordinates) && firstRoute.geometry.coordinates.length >= 2) {
    const dist = Math.round(firstRoute.distance ?? 0);
    const res: RouteFetchResult = {
      geometry: firstRoute.geometry, distanceMeters: dist,
      durationMinutes: Math.max(1, Math.round((firstRoute.duration ?? 60) / 60)), source: 'osrm',
      firstStepInstruction: formatFirstStepInstruction(firstRoute.legs?.[0]?.steps, dist),
    };
    saveRouteToCache(cacheKey, res);
    return res;
  }

  const fallbackDist = computeHaversineMeters(fromCoord, toCoord);
  const fallbackRes: RouteFetchResult = {
    geometry: buildInterpolatedFallbackRoute(fromCoord, toCoord, 12),
    distanceMeters: fallbackDist, durationMinutes: Math.max(1, Math.round(fallbackDist / 350)), source: 'fallback',
    firstStepInstruction: formatFirstStepInstruction(undefined, fallbackDist),
  };
  saveRouteToCache(cacheKey, fallbackRes);
  return fallbackRes;
}
