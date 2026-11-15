import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { GeoCoord, GeoJsonLineString } from '../../types/rescue';
import { buildAccuracyCirclePolygon } from '../../utils/gpsWatcher';

export const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [],
};

function ensureCasedRouteLayer(map: MapLibreMap, sourceId: string, color: string, lineWidth: number): void {
  if (!map.getSource(sourceId)) map.addSource(sourceId, { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  const shadowId = `${sourceId}-shadow`;
  if (!map.getLayer(shadowId)) {
    map.addLayer({
      id: shadowId, type: 'line', source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#090d16', 'line-width': 10, 'line-opacity': 0.16, 'line-blur': 3.5 },
    });
  }
  const casingId = `${sourceId}-casing`;
  if (!map.getLayer(casingId)) {
    map.addLayer({
      id: casingId, type: 'line', source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 7.5, 'line-opacity': 0.96 },
    });
  }
  const lineId = `${sourceId}-line`;
  if (!map.getLayer(lineId)) {
    map.addLayer({
      id: lineId, type: 'line', source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': lineWidth, 'line-opacity': 1 },
    });
  }
}

export const ROUTE_SOURCE_ID = 'motosos-route-source';
export const ROUTE_CASING_LAYER_ID = 'motosos-route-casing';
export const ROUTE_LINE_LAYER_ID = 'motosos-route-line';

export function ensureRescueRouteLayers(map: MapLibreMap): void {
  if (!map.getSource('gps-accuracy-circle')) {
    map.addSource('gps-accuracy-circle', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  }
  if (!map.getLayer('gps-accuracy-fill')) {
    map.addLayer({
      id: 'gps-accuracy-fill', type: 'fill', source: 'gps-accuracy-circle',
      paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 },
    });
  }
  if (!map.getLayer('gps-accuracy-stroke')) {
    map.addLayer({
      id: 'gps-accuracy-stroke', type: 'line', source: 'gps-accuracy-circle',
      paint: { 'line-color': '#60a5fa', 'line-opacity': 0.4, 'line-width': 1.5 },
    });
  }

  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  }
  const shadowId = `${ROUTE_SOURCE_ID}-shadow`;
  if (!map.getLayer(shadowId)) {
    map.addLayer({
      id: shadowId, type: 'line', source: ROUTE_SOURCE_ID,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#090d16', 'line-width': 10, 'line-opacity': 0.16, 'line-blur': 3 },
    });
  }
  if (!map.getLayer(ROUTE_CASING_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_CASING_LAYER_ID, type: 'line', source: ROUTE_SOURCE_ID,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 7.5, 'line-opacity': 0.96 },
    });
  }
  if (!map.getLayer(ROUTE_LINE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LINE_LAYER_ID, type: 'line', source: ROUTE_SOURCE_ID,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#4f46e5', 'line-width': 4.5, 'line-opacity': 1 },
    });
  }

  ensureCasedRouteLayer(map, 'mechanic-route', '#f59e0b', 4);
}

export function setUnifiedRouteGeometry(map: MapLibreMap, geometry: GeoJsonLineString | null): void {
  setRouteSourceGeometry(map, ROUTE_SOURCE_ID, geometry);
}

export function setRouteSourceGeometry(map: MapLibreMap, sourceId: string, geometry: GeoJsonLineString | null): void {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  if (!source) return;
  if (!geometry) {
    source.setData(EMPTY_FEATURE_COLLECTION);
    return;
  }
  source.setData({ type: 'Feature', properties: {}, geometry });
}

export function setAccuracyCircleGeoJson(map: MapLibreMap, coord: GeoCoord, accuracyMeters: number | null | undefined): void {
  const source = map.getSource('gps-accuracy-circle') as GeoJSONSource | undefined;
  if (!source) return;
  if (typeof accuracyMeters !== 'number' || !Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    source.setData(EMPTY_FEATURE_COLLECTION);
    return;
  }
  source.setData(buildAccuracyCirclePolygon(coord, accuracyMeters));
}

export function getViewportPadding(container: HTMLDivElement | null, forRoute: boolean) {
  const height = container?.clientHeight ?? window.innerHeight;
  const safeBottom = forRoute
    ? Math.min(Math.round(height * 0.61), Math.max(220, height - 180))
    : Math.min(240, Math.max(160, Math.round(height * 0.34)));
  return { top: forRoute ? 108 : 52, bottom: safeBottom, left: 36, right: 36 };
}

export function fitMapBoundsSafely(
  map: MapLibreMap, container: HTMLDivElement | null, bounds: [[number, number], [number, number]], maxZoom: number, duration = 550,
): void {
  map.resize();
  map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
  map.fitBounds(bounds, { padding: getViewportPadding(container, true), duration, maxZoom });
}

export const POIS_SOURCE_ID = 'pois-source';
export const POIS_CLUSTER_LAYER_ID = 'pois-cluster-layer';
export const POIS_CLUSTER_COUNT_ID = 'pois-cluster-count';
export const POIS_SELECTED_HALO_ID = 'pois-selected-halo';
export const POIS_UNCLUSTERED_LAYER_ID = 'pois-unclustered-layer';
export const POIS_LABEL_LAYER_ID = 'pois-label-layer';

export function ensurePoisLayers(map: MapLibreMap): void {
  // Gỡ các layer cụm hoặc nhãn cũ nếu có
  if (map.getLayer(POIS_CLUSTER_COUNT_ID)) map.removeLayer(POIS_CLUSTER_COUNT_ID);
  if (map.getLayer(POIS_CLUSTER_LAYER_ID)) map.removeLayer(POIS_CLUSTER_LAYER_ID);
  if (map.getLayer(POIS_LABEL_LAYER_ID)) map.removeLayer(POIS_LABEL_LAYER_ID);

  if (!map.getSource(POIS_SOURCE_ID)) {
    map.addSource(POIS_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_FEATURE_COLLECTION,
      cluster: false,
    });
  }

  // 1. Vòng hào quang xanh ngọc nổi bật cho điểm đang chọn
  if (!map.getLayer(POIS_SELECTED_HALO_ID)) {
    map.addLayer({
      id: POIS_SELECTED_HALO_ID, type: 'circle', source: POIS_SOURCE_ID,
      filter: ['==', ['get', 'isHighlighted'], true],
      paint: {
        'circle-color': '#10B981',
        'circle-radius': 28,
        'circle-opacity': 0.28,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#10B981',
        'circle-stroke-opacity': 0.65,
      },
    });
  }

  // 2. Ghim tròn chuẩn mẫu với viền trắng, bóng đổ và icon nét mảnh (GPU 120fps)
  if (!map.getLayer(POIS_UNCLUSTERED_LAYER_ID)) {
    map.addLayer({
      id: POIS_UNCLUSTERED_LAYER_ID, type: 'symbol', source: POIS_SOURCE_ID,
      layout: {
        'icon-image': [
          'match',
          ['get', 'category'],
          'mechanic', 'pin-mechanic',
          'fuel', 'pin-fuel',
          'police', 'pin-police',
          'pin-store',
        ],
        'icon-anchor': 'center',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-size': [
          'case',
          ['boolean', ['get', 'isHighlighted'], false], 1.16,
          0.92,
        ],
      },
    });
  }
}

export function setPoisGeoJson(map: MapLibreMap, data: unknown): void {
  const source = map.getSource(POIS_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) source.setData(data as Parameters<GeoJSONSource['setData']>[0]);
}
