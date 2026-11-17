import type { MapLayerMouseEvent, Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef, type MutableRefObject } from 'react';
import {
  EMPTY_FEATURE_COLLECTION,
  POIS_UNCLUSTERED_LAYER_ID,
  fitSafeHavenBounds,
  setPoisGeoJson,
  setUserSafehavenRouteGeometry,
} from '../components/map/mapLayers';
import type {
  GasStation,
  GeoCoord,
  GeoJsonLineString,
  InspectedPlace,
  MapLayerFilter,
  PickupMode,
  PoliceStation,
  RepairShop,
  RescueStep,
  SafeStation,
  SelectedDestination,
} from '../types/rescue';

interface UseMapMarkersSyncParams {
  mapRef: MutableRefObject<MapLibreMap | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  mapReady: boolean;
  userCoord: GeoCoord;
  stations: SafeStation[];
  openRepairShops: RepairShop[];
  gasStations: GasStation[];
  policeStations: PoliceStation[];
  selectedDestination: SelectedDestination | null;
  selectedStationId: string | null;
  activeRouteGeoJson: GeoJsonLineString | null;
  mapFilter: MapLayerFilter;
  step: RescueStep;
  pickupMode: PickupMode;
  onInspectPlace: (place: InspectedPlace) => void;
  onSelectStation: (stationId: string) => void;
  onSelectGasStation: (stationId: string | null) => void;
  onSelectPoliceStation: (stationId: string | null) => void;
}

export function useMapMarkersSync(params: UseMapMarkersSyncParams) {
  const {
    mapRef, containerRef, mapReady, userCoord, stations, openRepairShops,
    gasStations, policeStations, selectedDestination, selectedStationId,
    activeRouteGeoJson, mapFilter, step, pickupMode, onInspectPlace,
    onSelectStation, onSelectGasStation, onSelectPoliceStation,
  } = params;

  const callbacksRef = useRef({ onInspectPlace, onSelectStation, onSelectGasStation, onSelectPoliceStation });
  callbacksRef.current = { onInspectPlace, onSelectStation, onSelectGasStation, onSelectPoliceStation };

  const dataRef = useRef({ stations, openRepairShops, gasStations, policeStations });
  dataRef.current = { stations, openRepairShops, gasStations, policeStations };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const features: Array<{
      type: 'Feature';
      properties: Record<string, unknown>;
      geometry: { type: 'Point'; coordinates: [number, number] };
    }> = [];

    const showAll = mapFilter === 'all';

    if (showAll || mapFilter === 'safe_stations') {
      stations.forEach((s) => {
        const isHighlighted = selectedDestination?.id === s.id ||
          (selectedStationId === s.id && (step === 'pickup' || step === 'tracking') && pickupMode === 'safe_station');
        const category = s.category === 'police' ? 'police' : s.category === 'gas_station' ? 'fuel' : 'store';
        features.push({
          type: 'Feature',
          properties: { id: s.id, kind: 'safe_station', category, name: s.name, isHighlighted },
          geometry: { type: 'Point', coordinates: [s.coord.lng, s.coord.lat] },
        });
      });
    }

    if (showAll || mapFilter === 'repair_shops') {
      openRepairShops.forEach((sh) => {
        features.push({
          type: 'Feature',
          properties: { id: sh.id, kind: 'repair_shop', category: 'mechanic', name: sh.name, isHighlighted: selectedDestination?.id === sh.id },
          geometry: { type: 'Point', coordinates: [sh.coord.lng, sh.coord.lat] },
        });
      });
    }

    if (showAll || mapFilter === 'gas_stations') {
      gasStations.forEach((g) => {
        features.push({
          type: 'Feature',
          properties: { id: g.id, kind: 'gas_station', category: 'fuel', name: g.name, isHighlighted: selectedDestination?.id === g.id },
          geometry: { type: 'Point', coordinates: [g.coord.lng, g.coord.lat] },
        });
      });
    }

    if (showAll || mapFilter === 'police_stations') {
      policeStations.forEach((p) => {
        features.push({
          type: 'Feature',
          properties: { id: p.id, kind: 'police_station', category: 'police', name: p.name, isHighlighted: selectedDestination?.id === p.id },
          geometry: { type: 'Point', coordinates: [p.coord.lng, p.coord.lat] },
        });
      });
    }

    setPoisGeoJson(map, { type: 'FeatureCollection', features });
  }, [mapReady, stations, openRepairShops, gasStations, policeStations, selectedDestination, selectedStationId, step, pickupMode, mapFilter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const handleClick = (e: MapLayerMouseEvent) => {
      const prop = e.features?.[0]?.properties;
      if (!prop) return;
      const id = String(prop.id);
      const kind = String(prop.kind);
      const { stations: st, openRepairShops: sh, gasStations: gs, policeStations: ps } = dataRef.current;
      const { onInspectPlace: oip, onSelectStation: oss, onSelectGasStation: osgs, onSelectPoliceStation: osps } = callbacksRef.current;

      if (kind === 'safe_station') {
        const station = st.find((s) => s.id === id);
        if (station) { oss(id); oip({ kind: 'safe_station', station }); }
      } else if (kind === 'repair_shop') {
        const shop = sh.find((s) => s.id === id);
        if (shop) oip({ kind: 'repair_shop', shop });
      } else if (kind === 'gas_station') {
        const gasStation = gs.find((g) => g.id === id);
        if (gasStation) { osgs(id); oip({ kind: 'gas_station', gasStation }); }
      } else if (kind === 'police_station') {
        const policeStation = ps.find((p) => p.id === id);
        if (policeStation) { osps(id); oip({ kind: 'police_station', policeStation }); }
      }
    };

    const handleEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
    const handleLeave = () => { map.getCanvas().style.cursor = ''; };

    map.on('click', POIS_UNCLUSTERED_LAYER_ID, handleClick);
    map.on('mouseenter', POIS_UNCLUSTERED_LAYER_ID, handleEnter);
    map.on('mouseleave', POIS_UNCLUSTERED_LAYER_ID, handleLeave);

    return () => {
      map.off('click', POIS_UNCLUSTERED_LAYER_ID, handleClick);
      map.off('mouseenter', POIS_UNCLUSTERED_LAYER_ID, handleEnter);
      map.off('mouseleave', POIS_UNCLUSTERED_LAYER_ID, handleLeave);
    };
  }, [mapReady]);

  // Cập nhật tuyến đường riêng của User tới Điểm An Toàn (User SafeHaven Layer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setUserSafehavenRouteGeometry(map, activeRouteGeoJson);
  }, [mapReady, activeRouteGeoJson]);

  // Tự động fitBounds thấy trọn con đường từ User tới Điểm An Toàn đích
  const prevDestIdRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedDestination) {
      if (!selectedDestination) prevDestIdRef.current = null;
      return;
    }
    if (prevDestIdRef.current === selectedDestination.id) return;
    prevDestIdRef.current = selectedDestination.id;

    fitSafeHavenBounds(map, userCoord, selectedDestination.coord, 450);
  }, [mapReady, selectedDestination, userCoord]);

  return {
    clearAllMarkers: () => {
      const map = mapRef.current;
      if (map) {
        setPoisGeoJson(map, EMPTY_FEATURE_COLLECTION);
        setUserSafehavenRouteGeometry(map, null);
      }
    },
  };
}
