import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_USER_LOCATION } from '../data/mockRescueData';
import type { GeoCoord, GeoJsonLineString, PoliceStation } from '../types/rescue';
import { fetchWalkingRoute } from '../utils/osrmApi';
import {
  buildFallbackPoliceStations,
  fetchNearbyPoliceStations,
} from '../utils/policeStationApi';

export function usePoliceStationState(userCoord: GeoCoord) {
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>(() =>
    buildFallbackPoliceStations(FALLBACK_USER_LOCATION.coord),
  );
  const [isLoadingPoliceStations, setIsLoadingPoliceStations] = useState(false);
  const [selectedPoliceStationId, setSelectedPoliceStationId] = useState<
    string | null
  >(null);
  const [policeRoute, setPoliceRoute] = useState<GeoJsonLineString | null>(null);
  const [isLoadingPoliceRoute, setIsLoadingPoliceRoute] = useState(false);
  const scanAbortRef = useRef<AbortController | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);

  const routeToPoliceStation = useCallback(
    async (station: PoliceStation, coordOverride?: GeoCoord) => {
      routeAbortRef.current?.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;
      setSelectedPoliceStationId(station.id);
      setIsLoadingPoliceRoute(true);

      try {
        const result = await fetchWalkingRoute(
          coordOverride ?? userCoord,
          station.coord,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setPoliceRoute(result.geometry);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPoliceRoute(false);
        }
      }
    },
    [userCoord.lat, userCoord.lng],
  );

  const scanNearbyPolice = useCallback(
    async (autoRouteNearest: boolean) => {
      scanAbortRef.current?.abort();
      const controller = new AbortController();
      scanAbortRef.current = controller;
      setIsLoadingPoliceStations(true);

      try {
        const res = await fetchNearbyPoliceStations(
          userCoord.lat,
          userCoord.lng,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setPoliceStations(res.stations);
        const nearest = res.stations[0] ?? null;
        setSelectedPoliceStationId(nearest?.id ?? null);
        if (autoRouteNearest && nearest) {
          await routeToPoliceStation(nearest);
        } else {
          setPoliceRoute(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPoliceStations(false);
        }
      }
    },
    [routeToPoliceStation, userCoord.lat, userCoord.lng],
  );

  useEffect(() => {
    void scanNearbyPolice(false);
    return () => {
      scanAbortRef.current?.abort();
    };
  }, [scanNearbyPolice]);

  useEffect(() => () => routeAbortRef.current?.abort(), []);

  const clearPoliceRoute = useCallback(() => {
    routeAbortRef.current?.abort();
    setPoliceRoute(null);
    setIsLoadingPoliceRoute(false);
  }, []);

  return {
    policeStations,
    isLoadingPoliceStations,
    selectedPoliceStationId,
    setSelectedPoliceStationId,
    policeRoute,
    isLoadingPoliceRoute,
    routeToPoliceStation,
    scanAndRouteNearestPolice: () => scanNearbyPolice(true),
    clearPoliceRoute,
  };
}
