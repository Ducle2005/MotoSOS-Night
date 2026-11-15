import type {
  GasStation,
  GeoCoord,
  PoliceStation,
  RepairShop,
  SafeStation,
} from '../types/rescue';
import { removeVietnameseAccents } from './offlineRescueLogic';
import { computeHaversineMeters, formatCompactStationAddress } from './rescueLogic';

export type Step2RowItem =
  | { kind: 'safe_station'; distance: number; station: SafeStation }
  | { kind: 'repair_shop'; distance: number; shop: RepairShop }
  | { kind: 'gas_station'; distance: number; gasStation: GasStation }
  | { kind: 'police_station'; distance: number; policeStation: PoliceStation };

export function normalizePlaceName(name: string): string {
  if (!name) return '';
  return removeVietnameseAccents(name)
    .toLowerCase()
    .replace(/\b(cua hang|tram|cay|tiem|tru so|chi nhanh|xang dau|xang|gas station|petrolimex|station|tien loi)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSameOrNearbyPlace(
  coordA: GeoCoord,
  nameA: string,
  coordB: GeoCoord,
  nameB: string,
  thresholdMeters = 35,
): boolean {
  const dist = computeHaversineMeters(coordA, coordB);
  if (dist < thresholdMeters) return true;

  const normA = normalizePlaceName(nameA);
  const normB = normalizePlaceName(nameB);
  if (normA && normB) {
    if (normA === normB && dist < 120) return true;
    if ((normA.includes(normB) || normB.includes(normA)) && dist < 60) return true;
  }

  return false;
}

export function buildDeterministicPlaceId(
  rawId: string | undefined,
  index: number,
  lat: number,
  lng: number,
): string {
  const cleanRaw = (rawId || 'loc').trim().replace(/[/\\?%*:|"<>]/g, '_');
  return `${cleanRaw}_${index}_${lat.toFixed(5)}_${lng.toFixed(5)}`;
}

export function extractPlaceDetails(row: Step2RowItem): {
  id: string;
  name: string;
  coord: GeoCoord;
} {
  if (row.kind === 'safe_station') {
    return { id: row.station.id, name: row.station.name, coord: row.station.coord };
  }
  if (row.kind === 'gas_station') {
    return { id: row.gasStation.id, name: row.gasStation.name, coord: row.gasStation.coord };
  }
  if (row.kind === 'police_station') {
    return { id: row.policeStation.id, name: row.policeStation.name, coord: row.policeStation.coord };
  }
  return { id: row.shop.id, name: row.shop.name, coord: row.shop.coord };
}

export function deduplicateStep2Places(rows: Step2RowItem[]): Step2RowItem[] {
  const uniqueRows: Step2RowItem[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const candidate = rows[i];
    const details = extractPlaceDetails(candidate);

    const existingIdx = uniqueRows.findIndex((existing) => {
      const existingDetails = extractPlaceDetails(existing);
      return isSameOrNearbyPlace(
        details.coord,
        details.name,
        existingDetails.coord,
        existingDetails.name,
        35,
      );
    });

    if (existingIdx === -1) {
      uniqueRows.push(candidate);
    } else {
      // Prioritize richer information: safe_station over gas_station
      const existing = uniqueRows[existingIdx];
      if (candidate.kind === 'safe_station' && existing.kind === 'gas_station') {
        uniqueRows[existingIdx] = candidate;
      }
    }
  }

  // Assign deterministic, strictly unique ID to each row
  return uniqueRows.map((row, index) => {
    if (row.kind === 'safe_station') {
      const newId = buildDeterministicPlaceId(
        row.station.id,
        index,
        row.station.coord.lat,
        row.station.coord.lng,
      );
      return { ...row, station: { ...row.station, id: newId } };
    }
    if (row.kind === 'gas_station') {
      const newId = buildDeterministicPlaceId(
        row.gasStation.id,
        index,
        row.gasStation.coord.lat,
        row.gasStation.coord.lng,
      );
      return { ...row, gasStation: { ...row.gasStation, id: newId } };
    }
    if (row.kind === 'police_station') {
      const newId = buildDeterministicPlaceId(
        row.policeStation.id,
        index,
        row.policeStation.coord.lat,
        row.policeStation.coord.lng,
      );
      return { ...row, policeStation: { ...row.policeStation, id: newId } };
    }
    const newId = buildDeterministicPlaceId(
      row.shop.id,
      index,
      row.shop.coord.lat,
      row.shop.coord.lng,
    );
    return { ...row, shop: { ...row.shop, id: newId } };
  });
}

export type ShelterItem =
  | { kind: 'safe_station'; distance: number; station: SafeStation }
  | { kind: 'police_station'; distance: number; police: PoliceStation }
  | { kind: 'gas_station'; distance: number; gas: GasStation };

export function cleanSafetyAddress(address: string): string {
  if (!address) return '';
  return formatCompactStationAddress(address)
    .replace(/\s+(Street|St)\b\.?/gi, '')
    .replace(/\b(Street|St|Saigon|Ho Chi Minh City|Ho Chi Minh|Vietnam)\b\.?/gi, '')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^,\s*|,\s*$/g, '');
}

export function deduplicateShelterItems(items: ShelterItem[]): ShelterItem[] {
  const PRIORITY: Record<ShelterItem['kind'], number> = {
    police_station: 3,
    safe_station: 2,
    gas_station: 1,
  };

  const result: ShelterItem[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const candidate = items[i];
    const candCoord =
      candidate.kind === 'police_station'
        ? candidate.police.coord
        : candidate.kind === 'safe_station'
          ? candidate.station.coord
          : candidate.gas.coord;
    const candName =
      candidate.kind === 'police_station'
        ? candidate.police.name
        : candidate.kind === 'safe_station'
          ? candidate.station.name
          : candidate.gas.name;

    const existingIdx = result.findIndex((existing) => {
      const existCoord =
        existing.kind === 'police_station'
          ? existing.police.coord
          : existing.kind === 'safe_station'
            ? existing.station.coord
            : existing.gas.coord;
      const existName =
        existing.kind === 'police_station'
          ? existing.police.name
          : existing.kind === 'safe_station'
            ? existing.station.name
            : existing.gas.name;

      return isSameOrNearbyPlace(candCoord, candName, existCoord, existName, 35);
    });

    if (existingIdx === -1) {
      result.push(candidate);
    } else {
      const existing = result[existingIdx];
      if (PRIORITY[candidate.kind] > PRIORITY[existing.kind]) {
        result[existingIdx] = candidate;
      }
    }
  }

  return result.sort((a, b) => a.distance - b.distance);
}
