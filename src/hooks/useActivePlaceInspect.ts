import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoCoord, GeoJsonLineString, InspectedPlace, SelectedDestination } from '../types/rescue';
import { fetchMechanicDrivingRoute, fetchWalkingRoute } from '../utils/osrmApi';

export interface RouteSummaryInfo {
  distanceMeters: number;
  durationMinutes: number;
}

export function useActivePlaceInspect(userCoord: GeoCoord) {
  const [selectedDestination, setSelectedDestination] = useState<SelectedDestination | null>(null);
  const [inspectedPlace, setInspectedPlace] = useState<InspectedPlace | null>(null);
  const [activeRouteGeoJson, setActiveRouteGeoJson] = useState<GeoJsonLineString | null>(null);
  const [inspectRouteSummary, setInspectRouteSummary] = useState<RouteSummaryInfo | null>(null);
  const [isLoadingInspectRoute, setIsLoadingInspectRoute] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clearActiveRoute = useCallback(() => {
    abortRef.current?.abort();
    setSelectedDestination(null);
    setInspectedPlace(null);
    setActiveRouteGeoJson(null);
    setInspectRouteSummary(null);
    setIsLoadingInspectRoute(false);
  }, []);

  const inspectAndRoutePlace = useCallback(
    async (place: InspectedPlace) => {
      // 1. Lập tức hủy bỏ request cũ đang chạy
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // 2. Xóa sạch dữ liệu đường cũ NGAY LẬP TỨC (không chờ API)
      setActiveRouteGeoJson(null);
      setInspectRouteSummary(null);
      setIsLoadingInspectRoute(true);

      const dest: SelectedDestination =
        place.kind === 'safe_station'
          ? {
              id: place.station.id,
              kind: 'safe_station',
              title: place.station.name,
              address: place.station.address,
              coord: place.station.coord,
            }
          : place.kind === 'repair_shop'
            ? {
                id: place.shop.id,
                kind: 'repair_shop',
                title: place.shop.name,
                address: place.shop.address,
                coord: place.shop.coord,
              }
            : place.kind === 'gas_station'
              ? {
                  id: place.gasStation.id,
                  kind: 'gas_station',
                  title: place.gasStation.name,
                  address: place.gasStation.address,
                  coord: place.gasStation.coord,
                }
              : {
                  id: place.policeStation.id,
                  kind: 'police_station',
                  title: place.policeStation.name,
                  address: place.policeStation.address,
                  coord: place.policeStation.coord,
                  isNearest: place.policeStation.isNearest,
                };

      setSelectedDestination(dest);
      setInspectedPlace(place);

      try {
        const result =
          place.kind === 'repair_shop'
            ? await fetchMechanicDrivingRoute(userCoord, dest.coord, controller.signal)
            : await fetchWalkingRoute(userCoord, dest.coord, controller.signal);

        if (!controller.signal.aborted) {
          setActiveRouteGeoJson(result.geometry);
          setInspectRouteSummary({
            distanceMeters: result.distanceMeters,
            durationMinutes: result.durationMinutes,
          });
        }
      } catch {
        // Ignored if aborted
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingInspectRoute(false);
        }
      }
    },
    [userCoord.lat, userCoord.lng],
  );

  return {
    selectedDestination,
    setSelectedDestination,
    inspectedPlace,
    activeRouteGeoJson,
    inspectRoute: activeRouteGeoJson,
    inspectRouteSummary,
    isLoadingInspectRoute,
    inspectAndRoutePlace,
    clearActiveRoute,
    clearInspection: clearActiveRoute,
  };
}
