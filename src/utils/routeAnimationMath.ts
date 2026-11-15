import type { GeoCoord } from '../types/rescue';
import { computeHaversineMeters } from './rescueLogic';

export const MECHANIC_ANIMATION_DURATION_MS = 50_000;

export interface RouteCumulativeProfile {
  cumulativeMeters: number[];
  totalMeters: number;
}

export interface RouteProgressSample {
  currentPos: [number, number];
  segmentIndex: number;
  remainingFraction: number;
  remainingCoordinates: [number, number][];
}

export function buildRouteCumulativeProfile(
  coordinates: [number, number][],
): RouteCumulativeProfile {
  if (coordinates.length === 0) {
    return { cumulativeMeters: [], totalMeters: 0 };
  }

  const cumulativeMeters: number[] = [0];
  let totalMeters = 0;

  for (let i = 1; i < coordinates.length; i += 1) {
    const prev: GeoCoord = { lng: coordinates[i - 1][0], lat: coordinates[i - 1][1] };
    const curr: GeoCoord = { lng: coordinates[i][0], lat: coordinates[i][1] };
    totalMeters += computeHaversineMeters(prev, curr);
    cumulativeMeters.push(totalMeters);
  }

  return { cumulativeMeters, totalMeters };
}

export function sampleRouteAtProgress(
  coordinates: [number, number][],
  profile: RouteCumulativeProfile,
  rawProgress: number,
): RouteProgressSample {
  if (coordinates.length === 0) {
    return {
      currentPos: [0, 0],
      segmentIndex: 0,
      remainingFraction: 0,
      remainingCoordinates: [],
    };
  }

  if (coordinates.length === 1) {
    return {
      currentPos: coordinates[0],
      segmentIndex: 0,
      remainingFraction: 0,
      remainingCoordinates: [],
    };
  }

  const progress = Math.min(1, Math.max(0, rawProgress));
  if (progress <= 0 || profile.totalMeters <= 0) {
    return {
      currentPos: coordinates[0],
      segmentIndex: 0,
      remainingFraction: 1,
      remainingCoordinates: [coordinates[0], ...coordinates.slice(1)],
    };
  }

  if (progress >= 1) {
    return {
      currentPos: coordinates[coordinates.length - 1],
      segmentIndex: coordinates.length - 2,
      remainingFraction: 0,
      remainingCoordinates: [],
    };
  }

  const targetMeters = profile.totalMeters * progress;
  let i = 0;
  while (
    i < profile.cumulativeMeters.length - 2 &&
    profile.cumulativeMeters[i + 1] < targetMeters
  ) {
    i += 1;
  }

  const startDist = profile.cumulativeMeters[i];
  const endDist = profile.cumulativeMeters[i + 1];
  const segLen = endDist - startDist;
  const segFraction =
    segLen > 0 ? Math.min(1, Math.max(0, (targetMeters - startDist) / segLen)) : 0;

  const [lng1, lat1] = coordinates[i];
  const [lng2, lat2] = coordinates[i + 1];
  const currentPos: [number, number] = [
    lng1 + (lng2 - lng1) * segFraction,
    lat1 + (lat2 - lat1) * segFraction,
  ];

  return {
    currentPos,
    segmentIndex: i,
    remainingFraction: 1 - progress,
    remainingCoordinates: [currentPos, ...coordinates.slice(i + 1)],
  };
}

export function computeRemainingEtaMinutes(
  initialEtaMinutes: number,
  remainingFraction: number,
): number {
  if (remainingFraction <= 0) return 0;
  return Math.max(1, Math.ceil(initialEtaMinutes * remainingFraction));
}
