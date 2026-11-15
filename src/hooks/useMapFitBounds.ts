import { LngLatBounds, type Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import type {
  GasStation,
  GeoCoord,
  MapLayerFilter,
  PoliceStation,
  RepairShop,
  SafeStation,
} from '../types/rescue';

export interface UseMapFitBoundsProps {
  mapRef: React.RefObject<MapLibreMap | null>;
  mapReady: boolean;
  mapFilter: MapLayerFilter;
  userCoord: GeoCoord;
  stations: SafeStation[];
  openRepairShops: RepairShop[];
  policeStations: PoliceStation[];
  gasStations: GasStation[];
  isPinPickerMode?: boolean;
}

export function getFilterTargetCoords(
  filter: MapLayerFilter,
  stations: SafeStation[],
  openRepairShops: RepairShop[],
  policeStations: PoliceStation[],
  gasStations: GasStation[]
): GeoCoord[] {
  switch (filter) {
    case 'safe_stations':
      return stations.map((s) => s.coord);
    case 'repair_shops':
      return openRepairShops.map((s) => s.coord);
    case 'police_stations':
      return policeStations.map((s) => s.coord);
    case 'gas_stations':
      return gasStations.map((s) => s.coord);
    case 'all':
      return [
        ...stations.slice(0, 2).map((s) => s.coord),
        ...openRepairShops.slice(0, 2).map((s) => s.coord),
        ...policeStations.slice(0, 1).map((s) => s.coord),
        ...gasStations.slice(0, 1).map((s) => s.coord),
      ];
    default:
      return [];
  }
}

export function useMapFitBounds({
  mapRef,
  mapReady,
  mapFilter,
  userCoord,
  stations,
  openRepairShops,
  policeStations,
  gasStations,
  isPinPickerMode = false,
}: UseMapFitBoundsProps) {
  const prevFilterRef = useRef<MapLayerFilter>(mapFilter);
  const pendingFitFilterRef = useRef<MapLayerFilter | null>(null);

  useEffect(() => {
    if (prevFilterRef.current !== mapFilter) {
      prevFilterRef.current = mapFilter;
      pendingFitFilterRef.current = mapFilter;
    }
  }, [mapFilter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || isPinPickerMode) return;

    const coords = getFilterTargetCoords(
      mapFilter,
      stations,
      openRepairShops,
      policeStations,
      gasStations
    );
    if (coords.length === 0) return;

    // Pick up to 4 nearest points to user
    const sorted = [...coords].sort((a, b) => {
      const distA = Math.hypot(a.lat - userCoord.lat, a.lng - userCoord.lng);
      const distB = Math.hypot(b.lat - userCoord.lat, b.lng - userCoord.lng);
      return distA - distB;
    });

    const nearestCoords = sorted.slice(0, 4);
    const bounds = map.getBounds();
    const isAnyOutside =
      !bounds || nearestCoords.some((c) => !bounds.contains([c.lng, c.lat]));

    if (isAnyOutside && pendingFitFilterRef.current === mapFilter) {
      const fitBounds = new LngLatBounds(
        [userCoord.lng, userCoord.lat],
        [userCoord.lng, userCoord.lat]
      );
      for (const c of nearestCoords) {
        fitBounds.extend([c.lng, c.lat]);
      }

      map.fitBounds(fitBounds, {
        padding: { top: 110, bottom: 260, left: 45, right: 45 },
        maxZoom: 15.5,
        duration: 600,
      });
      pendingFitFilterRef.current = null;
    }
  }, [
    mapRef,
    mapReady,
    mapFilter,
    userCoord.lat,
    userCoord.lng,
    stations,
    openRepairShops,
    policeStations,
    gasStations,
    isPinPickerMode,
  ]);
}
