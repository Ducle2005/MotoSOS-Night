import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_HCMC_COORD,
  FALLBACK_USER_LOCATION,
  MOCK_SAFE_STATIONS,
} from '../data/mockRescueData';
import type {
  ActiveLocation,
  GeoCoord,
  GeoJsonLineString,
  LocationSuggestion,
  PickupMode,
  RescueStep,
  SafeStation,
  UserLocation,
} from '../types/rescue';
import { reverseGeocodeCoord } from '../utils/geocodeApi';
import { watchBestGpsPosition } from '../utils/gpsWatcher';
import { fetchNearbySafeStations, fetchWalkingRoute } from '../utils/mapApi';
import { getNearestSafeStation } from '../utils/rescueLogic';

export function useRescueGeo(
  step: RescueStep,
  pickupMode: PickupMode,
  selectedStation: SafeStation | null,
  onStationsReady: (stations: SafeStation[]) => void,
) {
  const [activeLocation, setActiveLocation] = useState<ActiveLocation>({
    lat: DEFAULT_HCMC_COORD.lat,
    lng: DEFAULT_HCMC_COORD.lng,
    address: FALLBACK_USER_LOCATION.address,
    isCurrentGPS: true,
    accuracyMeters: null,
  });
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [stations, setStations] = useState<SafeStation[]>(MOCK_SAFE_STATIONS);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [walkingRoute, setWalkingRoute] = useState<GeoJsonLineString | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ distanceMeters: number; durationMinutes: number } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  const applyReverseGeocodedCoord = useCallback(
    async (coord: GeoCoord, isRealGps: boolean, accuracyMeters: number | null) => {
      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;

      const resolvedAddress = await reverseGeocodeCoord(coord, controller.signal);
      if (controller.signal.aborted) return;

      setActiveLocation({
        lat: coord.lat,
        lng: coord.lng,
        address:
          isRealGps || !resolvedAddress.startsWith('Vị trí GPS')
            ? resolvedAddress
            : FALLBACK_USER_LOCATION.address,
        isCurrentGPS: true,
        accuracyMeters,
      });
    },
    [],
  );

  const useCurrentGpsLocation = useCallback(async (): Promise<void> => {
    setIsLocatingGps(true);
    try {
      const bestFix = await watchBestGpsPosition(2500, 20);
      if (bestFix) {
        setActiveLocation((prev) => ({
          lat: bestFix.coord.lat,
          lng: bestFix.coord.lng,
          address: prev.address,
          isCurrentGPS: true,
          accuracyMeters: bestFix.accuracyMeters,
        }));
        await applyReverseGeocodedCoord(bestFix.coord, true, bestFix.accuracyMeters);
      } else {
        await applyReverseGeocodedCoord(DEFAULT_HCMC_COORD, false, null);
      }
    } finally {
      setIsLocatingGps(false);
    }
  }, [applyReverseGeocodedCoord]);

  useEffect(() => {
    useCurrentGpsLocation();
    return () => geocodeAbortRef.current?.abort();
  }, [useCurrentGpsLocation]);

  const selectSearchedLocation = useCallback((item: LocationSuggestion) => {
    geocodeAbortRef.current?.abort();
    setActiveLocation({
      lat: item.lat,
      lng: item.lng,
      address: item.fullAddress,
      isCurrentGPS: false,
      accuracyMeters: null,
    });
  }, []);

  const confirmPinnedLocation = useCallback((coord: GeoCoord, address: string) => {
    geocodeAbortRef.current?.abort();
    setActiveLocation({
      lat: coord.lat,
      lng: coord.lng,
      address,
      isCurrentGPS: false,
      accuracyMeters: null,
    });
  }, []);

  const userLocation: UserLocation = useMemo(
    () => ({
      address: activeLocation.address,
      district: activeLocation.isCurrentGPS
        ? 'Vị trí GPS hiện tại'
        : 'Địa điểm đã chọn',
      coord: { lat: activeLocation.lat, lng: activeLocation.lng },
      source: activeLocation.isCurrentGPS ? 'gps' : 'fallback',
      accuracyMeters: activeLocation.isCurrentGPS
        ? activeLocation.accuracyMeters
        : null,
    }),
    [activeLocation],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingStations(true);

    fetchNearbySafeStations(
      { lat: activeLocation.lat, lng: activeLocation.lng },
      controller.signal,
    )
      .then(({ stations: nextStations }) => {
        if (controller.signal.aborted) return;
        setStations(nextStations);
        onStationsReady(nextStations);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingStations(false);
        }
      });

    return () => controller.abort();
  }, [activeLocation.lat, activeLocation.lng]);

  useEffect(() => {
    const shouldRoute =
      (step === 'pickup' || step === 'tracking') &&
      pickupMode === 'safe_station' &&
      selectedStation !== null;

    if (!shouldRoute || !selectedStation) {
      setWalkingRoute(null);
      setRouteSummary(null);
      setIsLoadingRoute(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingRoute(true);

    fetchWalkingRoute(
      { lat: activeLocation.lat, lng: activeLocation.lng },
      selectedStation.coord,
      controller.signal,
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setWalkingRoute(res.geometry);
        setRouteSummary({
          distanceMeters: res.distanceMeters,
          durationMinutes: res.durationMinutes,
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingRoute(false);
        }
      });

    return () => controller.abort();
  }, [
    step,
    pickupMode,
    activeLocation.lat,
    activeLocation.lng,
    selectedStation?.id,
  ]);

  const nearestStation = getNearestSafeStation(stations);

  return {
    activeLocation,
    userLocation,
    isLocatingGps,
    selectSearchedLocation,
    confirmPinnedLocation,
    useCurrentGpsLocation,
    stations,
    nearestStation,
    isLoadingStations,
    walkingRoute,
    routeSummary,
    isLoadingRoute,
    clearRoute: () => {
      setWalkingRoute(null);
      setRouteSummary(null);
    },
  };
}
