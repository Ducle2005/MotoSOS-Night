import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_USER_LOCATION } from '../data/mockRescueData';
import type { GasStation, GeoCoord, GeoJsonLineString } from '../types/rescue';
import {
  buildFallbackGasStations,
  fetchNearbyGasStations,
} from '../utils/gasStationApi';
import { fetchWalkingRoute } from '../utils/osrmApi';

export function useGasStationState(userCoord: GeoCoord) {
  const [gasStations, setGasStations] = useState<GasStation[]>(() =>
    buildFallbackGasStations(FALLBACK_USER_LOCATION.coord),
  );
  const [isLoadingGasStations, setIsLoadingGasStations] = useState(false);
  const [selectedGasStationId, setSelectedGasStationId] = useState<string | null>(
    null,
  );
  const [gasRoute, setGasRoute] = useState<GeoJsonLineString | null>(null);
  const [isLoadingGasRoute, setIsLoadingGasRoute] = useState(false);
  const routeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingGasStations(true);

    fetchNearbyGasStations(userCoord.lat, userCoord.lng, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setGasStations(res.stations);
          setSelectedGasStationId(res.stations[0]?.id ?? null);
          setGasRoute(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingGasStations(false);
        }
      });

    return () => controller.abort();
  }, [userCoord.lat, userCoord.lng]);

  useEffect(() => {
    return () => routeAbortRef.current?.abort();
  }, []);

  const routeToGasStation = useCallback(
    async (station: GasStation) => {
      routeAbortRef.current?.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;
      setSelectedGasStationId(station.id);
      setIsLoadingGasRoute(true);

      try {
        const result = await fetchWalkingRoute(
          userCoord,
          station.coord,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setGasRoute(result.geometry);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingGasRoute(false);
        }
      }
    },
    [userCoord.lat, userCoord.lng],
  );

  const clearGasRoute = useCallback(() => {
    routeAbortRef.current?.abort();
    setGasRoute(null);
    setIsLoadingGasRoute(false);
  }, []);

  return {
    gasStations,
    isLoadingGasStations,
    selectedGasStationId,
    setSelectedGasStationId,
    gasRoute,
    isLoadingGasRoute,
    routeToGasStation,
    clearGasRoute,
  };
}
