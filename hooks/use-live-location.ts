import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type LiveLocationPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

export type TrackingState = 'idle' | 'requesting' | 'tracking' | 'denied' | 'unsupported' | 'error';

type LocationModule = {
  getCurrentPosition: (
    success: (position: any) => void,
    error?: (error: { code?: number; message?: string }) => void,
    options?: Record<string, unknown>,
  ) => void;
  watchPosition: (
    success: (position: any) => void,
    error?: (error: { code?: number; message?: string }) => void,
    options?: Record<string, unknown>,
  ) => number;
  clearWatch: (watchId: number) => void;
};

const getLocationModule = (): LocationModule | null => {
  const navigatorMaybe = globalThis.navigator as Navigator | undefined;
  return (navigatorMaybe?.geolocation as LocationModule | undefined) ?? null;
};

const normalizeLocation = (location: any): LiveLocationPoint => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: typeof location.coords.accuracy === 'number' ? location.coords.accuracy : null,
  heading: typeof location.coords.heading === 'number' ? location.coords.heading : null,
  speed: typeof location.coords.speed === 'number' ? location.coords.speed : null,
  timestamp: typeof location.timestamp === 'number' ? location.timestamp : Date.now(),
});

export function useLiveLocation() {
  const locationModule = useMemo(() => getLocationModule(), []);
  const watcherRef = useRef<number | null>(null);

  const [trackingState, setTrackingState] = useState<TrackingState>(
    locationModule ? 'idle' : 'unsupported',
  );
  const [location, setLocation] = useState<LiveLocationPoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    locationModule ? null : 'Location package not installed.',
  );

  const stopTracking = useCallback(() => {
    if (watcherRef.current !== null && locationModule) {
      locationModule.clearWatch(watcherRef.current);
      watcherRef.current = null;
    }

    setTrackingState((current) => (current === 'unsupported' ? current : 'idle'));
  }, [locationModule]);

  const startTracking = useCallback(async () => {
    if (!locationModule) {
      setTrackingState('unsupported');
      setErrorMessage('Geolocation is not available on this device/runtime.');
      return;
    }

    setTrackingState('requesting');
    setErrorMessage(null);

    try {
      await new Promise<void>((resolve, reject) => {
        locationModule.getCurrentPosition(
          (currentPosition) => {
            setLocation(normalizeLocation(currentPosition));
            resolve();
          },
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 1000 },
        );
      });

      if (watcherRef.current !== null) {
        locationModule.clearWatch(watcherRef.current);
      }

      watcherRef.current = locationModule.watchPosition(
        (nextLocation) => {
          setLocation(normalizeLocation(nextLocation));
          setTrackingState('tracking');
        },
        (watchError) => {
          if (watchError?.code === 1) {
            setTrackingState('denied');
            setErrorMessage('Location permission denied. Enable it in device settings.');
            return;
          }

          setTrackingState('error');
          setErrorMessage(watchError?.message || 'Unable to keep tracking live location.');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 1000 },
      );

      setTrackingState('tracking');
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 1) {
        setTrackingState('denied');
        setErrorMessage('Location permission denied. Enable it in device settings.');
        return;
      }

      setTrackingState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start location tracking.');
    }
  }, [locationModule]);

  useEffect(
    () => () => {
      if (watcherRef.current !== null && locationModule) {
        locationModule.clearWatch(watcherRef.current);
      }
    },
    [locationModule],
  );

  return {
    location,
    trackingState,
    errorMessage,
    isSupported: Boolean(locationModule),
    startTracking,
    stopTracking,
  };
}
