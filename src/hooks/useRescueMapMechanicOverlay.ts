import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import {
  fitMapBoundsSafely,
  setRouteSourceGeometry,
} from '../components/map/mapLayers';
import {
  createMechanicMarkerElement,
  updateMechanicMarkerElement,
} from '../components/map/mapMarkers';
import type {
  GeoCoord,
  GeoJsonLineString,
  RescueStep,
  TrackingStatus,
} from '../types/rescue';
import { computeBoundsBox } from '../utils/rescueLogic';
import {
  buildRouteCumulativeProfile,
  computeRemainingEtaMinutes,
  MECHANIC_ANIMATION_DURATION_MS,
  sampleRouteAtProgress,
} from '../utils/routeAnimationMath';

interface UseRescueMapMechanicOverlayArgs {
  mapRef: React.MutableRefObject<MapLibreMap | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  mapReady: boolean;
  step: RescueStep;
  trackingStatus: TrackingStatus;
  mechanicRoute: GeoJsonLineString | null;
  routeStartTimeMs: number | null;
  initialEtaMinutes: number;
  pickupCoord: GeoCoord;
  mechanicName: string;
  onEtaMinuteChange: (etaMinutes: number) => void;
  onMechanicApproaching?: () => void;
  onMechanicArrived: () => void;
}

export function useRescueMapMechanicOverlay({
  mapRef,
  containerRef,
  mapReady,
  step,
  trackingStatus,
  mechanicRoute,
  routeStartTimeMs,
  initialEtaMinutes,
  pickupCoord,
  mechanicName,
  onEtaMinuteChange,
  onMechanicApproaching,
  onMechanicArrived,
}: UseRescueMapMechanicOverlayArgs) {
  const mechanicMarkerRef = useRef<Marker | null>(null);
  const fittedRouteRef = useRef<GeoJsonLineString | null>(null);
  const approachingCbRef = useRef(onMechanicApproaching);
  approachingCbRef.current = onMechanicApproaching;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const showMechanicPhase =
      step === 'tracking' &&
      (trackingStatus === 'accepted' ||
        trackingStatus === 'arrived' ||
        trackingStatus === 'completed');

    if (!showMechanicPhase || !mechanicRoute || mechanicRoute.coordinates.length < 2) {
      mechanicMarkerRef.current?.remove();
      mechanicMarkerRef.current = null;
      setRouteSourceGeometry(map, 'mechanic-route', null);
      if (!showMechanicPhase) fittedRouteRef.current = null;
      return;
    }

    const coords = mechanicRoute.coordinates;
    const isFinished =
      trackingStatus === 'arrived' || trackingStatus === 'completed';

    if (fittedRouteRef.current !== mechanicRoute) {
      fittedRouteRef.current = mechanicRoute;
      const bounds = computeBoundsBox(coords);
      if (bounds) {
        fitMapBoundsSafely(map, containerRef.current, bounds, 16.2, 550);
      }
    }

    const ensureMarkerAt = (lngLat: [number, number], eta: number, done: boolean) => {
      if (!mechanicMarkerRef.current) {
        const el = createMechanicMarkerElement(mechanicName, eta, done);
        mechanicMarkerRef.current = new Marker({ element: el, anchor: 'center' })
          .setLngLat(lngLat)
          .addTo(map);
      } else {
        mechanicMarkerRef.current.setLngLat(lngLat);
        updateMechanicMarkerElement(
          mechanicMarkerRef.current.getElement(),
          mechanicName,
          eta,
          done,
        );
      }
    };

    if (isFinished) {
      const endPos = coords[coords.length - 1] ?? [pickupCoord.lng, pickupCoord.lat];
      setRouteSourceGeometry(map, 'mechanic-route', null);
      ensureMarkerAt(endPos, 0, true);
      onEtaMinuteChange(0);
      return;
    }

    // Lock marker strictly to coordinates[0] immediately upon receiving OSRM route
    const profile = buildRouteCumulativeProfile(coords);
    const startOriginMs = routeStartTimeMs ?? performance.now();
    let lastNotifiedEta = initialEtaMinutes;
    let approachingNotified = false;
    let arrivalNotified = false;
    let rafId = 0;

    const initialSample = sampleRouteAtProgress(
      coords,
      profile,
      Math.max(0, performance.now() - startOriginMs) / MECHANIC_ANIMATION_DURATION_MS,
    );
    ensureMarkerAt(initialSample.currentPos, initialEtaMinutes, false);

    const stepFrame = (now: number) => {
      const elapsed = Math.max(0, now - startOriginMs);
      const progress = Math.min(1, elapsed / MECHANIC_ANIMATION_DURATION_MS);
      const sample = sampleRouteAtProgress(coords, profile, progress);

      mechanicMarkerRef.current?.setLngLat(sample.currentPos);

      if (!approachingNotified && progress >= 0.75 && progress < 1) {
        approachingNotified = true;
        approachingCbRef.current?.();
      }

      if (sample.remainingCoordinates.length >= 2) {
        setRouteSourceGeometry(map, 'mechanic-route', {
          type: 'LineString',
          coordinates: sample.remainingCoordinates,
        });
      } else {
        setRouteSourceGeometry(map, 'mechanic-route', null);
      }

      const nextEta = computeRemainingEtaMinutes(
        initialEtaMinutes,
        sample.remainingFraction,
      );
      if (nextEta !== lastNotifiedEta) {
        lastNotifiedEta = nextEta;
        if (mechanicMarkerRef.current) {
          updateMechanicMarkerElement(
            mechanicMarkerRef.current.getElement(),
            mechanicName,
            nextEta,
            progress >= 1,
          );
        }
        onEtaMinuteChange(nextEta);
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(stepFrame);
      } else if (!arrivalNotified) {
        arrivalNotified = true;
        setRouteSourceGeometry(map, 'mechanic-route', null);
        if (mechanicMarkerRef.current) {
          updateMechanicMarkerElement(
            mechanicMarkerRef.current.getElement(),
            mechanicName,
            0,
            true,
          );
        }
        onEtaMinuteChange(0);
        onMechanicArrived();
      }
    };

    rafId = window.requestAnimationFrame(stepFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    step,
    trackingStatus,
    mechanicRoute,
    routeStartTimeMs,
    initialEtaMinutes,
    pickupCoord.lat,
    pickupCoord.lng,
    mechanicName,
    mapReady,
  ]);

  return mechanicMarkerRef;
}
