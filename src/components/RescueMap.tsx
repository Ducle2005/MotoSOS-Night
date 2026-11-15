import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { useEffect, useRef, useState } from 'react';
import { useMapFitBounds } from '../hooks/useMapFitBounds';
import { useMapMarkersSync } from '../hooks/useMapMarkersSync';
import { useRescueMapMechanicOverlay } from '../hooks/useRescueMapMechanicOverlay';
import type {
  GasStation,
  GeoCoord,
  GeoJsonLineString,
  InspectedPlace,
  MapLayerFilter,
  MechanicInfo,
  PickupMode,
  PoliceStation,
  RepairShop,
  RescueStep,
  SafeStation,
  SelectedDestination,
  TrackingStatus,
  UserLocation,
} from '../types/rescue';
import {
  ensurePoisLayers,
  ensureRescueRouteLayers,
  getViewportPadding,
  setAccuracyCircleGeoJson,
} from './map/mapLayers';
import { CenterPinOverlay } from './map/CenterPinOverlay';
import { createUserMarkerElement } from './map/mapMarkers';
import { registerMotoSosMapIcons } from '../utils/mapPinIcons';

setWorkerUrl(maplibreWorkerUrl);

const CARTO_POSITRON_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface RescueMapProps {
  userLocation: UserLocation; stations: SafeStation[]; openRepairShops: RepairShop[];
  gasStations: GasStation[]; policeStations: PoliceStation[];
  selectedDestination?: SelectedDestination | null;
  selectedStationId: string | null; selectedPoliceStationId: string | null;
  inspectedPlace: InspectedPlace | null;
  activeRouteGeoJson?: GeoJsonLineString | null; inspectRoute?: GeoJsonLineString | null;
  mapFilter: MapLayerFilter; pickupMode: PickupMode; pickupCoord: GeoCoord;
  walkingRoute?: GeoJsonLineString | null; gasRoute?: GeoJsonLineString | null; policeRoute?: GeoJsonLineString | null;
  mechanicRoute: GeoJsonLineString | null; routeStartTimeMs: number | null; initialEtaMinutes: number;
  step: RescueStep; trackingStatus: TrackingStatus; mechanic: MechanicInfo; recenterSignal: number;
  isPinPickerMode?: boolean; isPinDragging?: boolean; isMapTabActive?: boolean;
  onSelectStation: (stationId: string) => void; onInspectPlace: (place: InspectedPlace) => void;
  onSelectGasStation: (stationId: string | null) => void; onSelectPoliceStation: (stationId: string | null) => void;
  onPinMoveStart?: () => void; onPinMoveEnd?: (coord: GeoCoord) => void;
  onEtaMinuteChange: (etaMinutes: number) => void; onMechanicApproaching?: () => void; onMechanicArrived: () => void;
}

export function RescueMap(props: RescueMapProps) {
  const {
    userLocation, stations, openRepairShops, gasStations, policeStations,
    selectedDestination, selectedStationId, inspectedPlace,
    activeRouteGeoJson, inspectRoute, mapFilter,
    pickupMode, pickupCoord, mechanicRoute, routeStartTimeMs,
    initialEtaMinutes, step, trackingStatus, mechanic, recenterSignal,
    isPinPickerMode = false, isPinDragging = false,
    onSelectStation, onInspectPlace, onSelectGasStation, onSelectPoliceStation,
    onPinMoveStart, onPinMoveEnd, onEtaMinuteChange, onMechanicApproaching, onMechanicArrived,
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mechanicMarkerRef = useRescueMapMechanicOverlay({
    mapRef, containerRef, mapReady, step, trackingStatus, mechanicRoute,
    routeStartTimeMs, initialEtaMinutes, pickupCoord, mechanicName: mechanic.name,
    onEtaMinuteChange, onMechanicApproaching, onMechanicArrived,
  });

  const effectiveRoute = activeRouteGeoJson ?? inspectRoute ?? null;
  const effectiveDestination = selectedDestination ?? (inspectedPlace ? {
    id: inspectedPlace.kind === 'safe_station' ? inspectedPlace.station.id : inspectedPlace.kind === 'repair_shop' ? inspectedPlace.shop.id : inspectedPlace.kind === 'gas_station' ? inspectedPlace.gasStation.id : inspectedPlace.policeStation.id,
    kind: inspectedPlace.kind,
    title: inspectedPlace.kind === 'safe_station' ? inspectedPlace.station.name : inspectedPlace.kind === 'repair_shop' ? inspectedPlace.shop.name : inspectedPlace.kind === 'gas_station' ? inspectedPlace.gasStation.name : inspectedPlace.policeStation.name,
    coord: inspectedPlace.kind === 'safe_station' ? inspectedPlace.station.coord : inspectedPlace.kind === 'repair_shop' ? inspectedPlace.shop.coord : inspectedPlace.kind === 'gas_station' ? inspectedPlace.gasStation.coord : inspectedPlace.policeStation.coord,
  } : null);

  const { clearAllMarkers } = useMapMarkersSync({
    mapRef, containerRef, mapReady, userCoord: userLocation.coord, stations,
    openRepairShops, gasStations, policeStations, selectedDestination: effectiveDestination,
    selectedStationId, activeRouteGeoJson: effectiveRoute, mapFilter, step, pickupMode,
    onInspectPlace, onSelectStation, onSelectGasStation, onSelectPoliceStation,
  });

  useMapFitBounds({
    mapRef, mapReady, mapFilter, userCoord: userLocation.coord,
    stations, openRepairShops, policeStations, gasStations, isPinPickerMode,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = new MapLibreMap({
      container: el,
      style: CARTO_POSITRON_STYLE_URL,
      center: [userLocation.coord.lng, userLocation.coord.lat],
      zoom: 15.2,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
      fadeDuration: 0,
      trackResize: true,
    });

    const handleStyleData = () => registerMotoSosMapIcons(map);
    map.on('styledata', handleStyleData);

    map.on('load', () => {
      registerMotoSosMapIcons(map);
      ensureRescueRouteLayers(map);
      ensurePoisLayers(map);
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      map.jumpTo({
        center: [userLocation.coord.lng, userLocation.coord.lat],
        padding: getViewportPadding(el, false),
      });
      setMapReady(true);
    });

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(el);
    mapRef.current = map;

    return () => {
      observer.disconnect();
      map.off('styledata', handleStyleData);
      clearAllMarkers();
      userMarkerRef.current?.remove();
      mechanicMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (props.isMapTabActive === false || !mapReady) return;
    const rafId = requestAnimationFrame(() => {
      mapRef.current?.resize();
    });
    return () => cancelAnimationFrame(rafId);
  }, [props.isMapTabActive, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    userMarkerRef.current?.remove();
    const isSearching = step === 'tracking' && trackingStatus === 'searching';
    const el = createUserMarkerElement(isSearching);
    userMarkerRef.current = new Marker({ element: el })
      .setLngLat([userLocation.coord.lng, userLocation.coord.lat])
      .addTo(map);
  }, [userLocation.coord.lat, userLocation.coord.lng, step, trackingStatus]);

  const prevRecenterRef = useRef(recenterSignal);
  const prevCoordRef = useRef(userLocation.coord);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const recenterChanged = prevRecenterRef.current !== recenterSignal;
    const coordChanged =
      prevCoordRef.current.lat !== userLocation.coord.lat ||
      prevCoordRef.current.lng !== userLocation.coord.lng;
    prevRecenterRef.current = recenterSignal;
    prevCoordRef.current = userLocation.coord;

    if (!recenterChanged && !coordChanged) return;
    map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
    map.flyTo({
      center: [userLocation.coord.lng, userLocation.coord.lat],
      zoom: 15.2,
      padding: getViewportPadding(containerRef.current, false),
      duration: 600,
    });
  }, [userLocation.coord.lat, userLocation.coord.lng, recenterSignal, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setAccuracyCircleGeoJson(map, userLocation.coord, userLocation.accuracyMeters);
  }, [userLocation.coord.lat, userLocation.coord.lng, userLocation.accuracyMeters, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !isPinPickerMode) return;

    const handleMoveStart = () => onPinMoveStart?.();
    const handleMoveEnd = () => {
      const el = containerRef.current;
      const point = el
        ? map.unproject([el.clientWidth / 2, el.clientHeight * 0.33])
        : map.getCenter();
      onPinMoveEnd?.({ lat: point.lat, lng: point.lng });
    };

    map.on('movestart', handleMoveStart);
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('movestart', handleMoveStart);
      map.off('moveend', handleMoveEnd);
    };
  }, [mapReady, isPinPickerMode, onPinMoveStart, onPinMoveEnd]);

  return (
    <section
      aria-label="Bản đồ thực tế khu vực, Trạm An Toàn và Tiệm sửa xe đang mở"
      data-testid="rescue-map-canvas"
      className="relative h-full w-full bg-slate-100"
    >
      <div ref={containerRef} className="h-full w-full" />
      {isPinPickerMode && <CenterPinOverlay isDragging={isPinDragging} />}
    </section>
  );
}
