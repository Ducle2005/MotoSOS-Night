import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_USER_LOCATION } from '../data/mockRescueData';
import type {
  GeoCoord,
  GeoJsonLineString,
  MapLayerFilter,
  RepairShop,
} from '../types/rescue';
import { fetchMechanicDrivingRoute } from '../utils/osrmApi';
import {
  buildRepairShopsFromSeed,
  fetchNearbyRepairShops,
  getOpenRepairShops,
} from '../utils/repairShopApi';

export function useRepairShopState(userCoord: GeoCoord) {
  const [shops, setShops] = useState<RepairShop[]>(() =>
    buildRepairShopsFromSeed(FALLBACK_USER_LOCATION.coord),
  );
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [mapFilter, setMapFilter] = useState<MapLayerFilter>('all');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopRoute, setShopRoute] = useState<GeoJsonLineString | null>(null);
  const [shopRouteSummary, setShopRouteSummary] = useState<{
    distanceMeters: number;
    durationMinutes: number;
  } | null>(null);
  const [isLoadingShopRoute, setIsLoadingShopRoute] = useState(false);
  const routeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingShops(true);
    fetchNearbyRepairShops(userCoord, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setShops(res.shops);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingShops(false);
        }
      });

    return () => controller.abort();
  }, [userCoord.lat, userCoord.lng]);

  useEffect(() => {
    return () => routeAbortRef.current?.abort();
  }, []);

  const openRepairShops = useMemo(() => getOpenRepairShops(shops), [shops]);

  const selectedShop = useMemo(
    () => openRepairShops.find((shop) => shop.id === selectedShopId) ?? null,
    [openRepairShops, selectedShopId],
  );

  const clearShopRoute = useCallback(() => {
    routeAbortRef.current?.abort();
    setShopRoute(null);
    setShopRouteSummary(null);
    setIsLoadingShopRoute(false);
  }, []);

  const selectShop = useCallback(
    (shopId: string | null) => {
      setSelectedShopId(shopId);
      setShopRoute(null);
      setShopRouteSummary(null);
      if (shopId === null) {
        routeAbortRef.current?.abort();
        setIsLoadingShopRoute(false);
      }
    },
    [],
  );

  const navigateToShop = useCallback(
    async (shop: RepairShop) => {
      routeAbortRef.current?.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;
      setIsLoadingShopRoute(true);
      try {
        const result = await fetchMechanicDrivingRoute(
          userCoord,
          shop.coord,
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setShopRoute(result.geometry);
          setShopRouteSummary({
            distanceMeters: result.distanceMeters,
            durationMinutes: result.durationMinutes,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingShopRoute(false);
        }
      }
    },
    [userCoord.lat, userCoord.lng],
  );

  const handleChangeMapFilter = useCallback(
    (nextFilter: MapLayerFilter) => {
      setMapFilter(nextFilter);
      if (nextFilter === 'safe_stations') {
        selectShop(null);
      }
    },
    [selectShop],
  );

  return {
    openRepairShops,
    isLoadingShops,
    mapFilter,
    setMapFilter: handleChangeMapFilter,
    selectedShopId,
    selectedShop,
    selectShop,
    shopRoute,
    shopRouteSummary,
    isLoadingShopRoute,
    navigateToShop,
    clearShopRoute,
  };
}
