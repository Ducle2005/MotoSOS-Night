import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_HCMC_COORD, FALLBACK_USER_LOCATION } from '../data/mockRescueData';
import type { GeoCoord } from '../types/rescue';
import { reverseGeocodeCoord } from '../utils/geocodeApi';

export function useMapPinPicker() {
  const [isPinPickerMode, setIsPinPickerMode] = useState(false);
  const [isPinDragging, setIsPinDragging] = useState(false);
  const [pinnedCoord, setPinnedCoord] = useState<GeoCoord>(DEFAULT_HCMC_COORD);
  const [pinnedAddress, setPinnedAddress] = useState(FALLBACK_USER_LOCATION.address);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => () => geocodeAbortRef.current?.abort(), []);

  const startPinPicker = useCallback((initialCoord: GeoCoord, initialAddress: string) => {
    geocodeAbortRef.current?.abort();
    setPinnedCoord(initialCoord);
    setPinnedAddress(initialAddress);
    setIsPinDragging(false);
    setIsResolvingPin(false);
    setIsPinPickerMode(true);
  }, []);

  const handlePinMoveStart = useCallback(() => {
    setIsPinDragging(true);
  }, []);

  const handlePinMoveEnd = useCallback(async (coord: GeoCoord) => {
    setIsPinDragging(false);
    setPinnedCoord(coord);
    geocodeAbortRef.current?.abort();

    const controller = new AbortController();
    geocodeAbortRef.current = controller;
    setIsResolvingPin(true);

    try {
      const address = await reverseGeocodeCoord(coord, controller.signal);
      if (!controller.signal.aborted) {
        setPinnedAddress(address);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsResolvingPin(false);
      }
    }
  }, []);

  const cancelPinPicker = useCallback(() => {
    geocodeAbortRef.current?.abort();
    setIsPinPickerMode(false);
    setIsPinDragging(false);
    setIsResolvingPin(false);
  }, []);

  const finishPinPicker = useCallback(() => {
    geocodeAbortRef.current?.abort();
    setIsPinPickerMode(false);
    setIsPinDragging(false);
    setIsResolvingPin(false);
    return { coord: pinnedCoord, address: pinnedAddress };
  }, [pinnedCoord, pinnedAddress]);

  return {
    isPinPickerMode,
    isPinDragging,
    pinnedCoord,
    pinnedAddress,
    isResolvingPin,
    startPinPicker,
    handlePinMoveStart,
    handlePinMoveEnd,
    cancelPinPicker,
    finishPinPicker,
  };
}
