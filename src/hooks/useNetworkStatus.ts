import { useCallback, useEffect, useState } from 'react';
import type { GeoCoord, SafeStation, UserLocation } from '../types/rescue';
import {
  type CachedOfflineData,
  buildOfflineSmsHref,
  loadOfflineCache,
  saveOfflineCache,
} from '../utils/offlineRescueLogic';

export interface UseNetworkStatusParams {
  activeLocation?: UserLocation;
  stations?: SafeStation[];
}

export function useNetworkStatus(params?: UseNetworkStatusParams) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [cachedData, setCachedData] = useState<CachedOfflineData | null>(loadOfflineCache);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto cache activeLocation and nearest station
  useEffect(() => {
    if (params?.activeLocation?.coord) {
      const nearest = params.stations?.[0];
      const nextCache: CachedOfflineData = {
        lat: params.activeLocation.coord.lat,
        lng: params.activeLocation.coord.lng,
        address: params.activeLocation.address,
        nearestStationName: nearest?.name,
        nearestStationDistMeters: nearest?.walkingDistanceMeters,
        timestamp: Date.now(),
      };
      setCachedData(nextCache);
      saveOfflineCache(nextCache);
    }
  }, [params?.activeLocation, params?.stations]);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => !prev);
  }, []);

  const isOffline = !isOnline || isSimulatedOffline;

  const getSmsLink = useCallback(
    (phone: string, serviceName?: string) => {
      const loc: { lat: number; lng: number; address: string } | null = params?.activeLocation
        ? {
            lat: params.activeLocation.coord.lat,
            lng: params.activeLocation.coord.lng,
            address: params.activeLocation.address,
          }
        : cachedData
          ? {
              lat: cachedData.lat,
              lng: cachedData.lng,
              address: cachedData.address,
            }
          : null;
      return buildOfflineSmsHref(phone, loc, serviceName);
    },
    [params?.activeLocation, cachedData],
  );

  return {
    isOnline,
    isSimulatedOffline,
    isOffline,
    toggleSimulatedOffline,
    cachedData,
    getSmsLink,
  };
}
