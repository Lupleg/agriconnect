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
  Accuracy: {
    Balanced: number;
    BestForNavigation: number;
  };
  requestForegroundPermissionsAsync: () => Promise<{ granted: boolean }>;
  getCurrentPositionAsync: (options: Record<string, unknown>) => Promise<any>;
  watchPositionAsync: (
    options: Record<string, unknown>,
    callback: (location: any) => void,
  ) => Promise<{ remove: () => void }>;
};

const getLocationModule = (): LocationModule | null => {
  try {
    return require('expo-location') as LocationModule;
  } catch {
    return null;
  }
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
  const watcherRef = useRef<{ remove: () => void } | null>(null);

  const [trackingState, setTrackingState] = useState<TrackingState>(
    locationModule ? 'idle' : 'unsupported',
  );
  const [location, setLocation] = useState<LiveLocationPoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    locationModule ? null : 'Location package not installed.',
  );

  const stopTracking = useCallback(() => {
    watcherRef.current?.remove();
    watcherRef.current = null;

    setTrackingState((current) => (current === 'unsupported' ? current : 'idle'));
  }, []);

  const startTracking = useCallback(async () => {
    if (!locationModule) {
      setTrackingState('unsupported');
      setErrorMessage('Location package not installed.');
      return;
    }

    setTrackingState('requesting');
    setErrorMessage(null);

    try {
      const permission = await locationModule.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setTrackingState('denied');
        setErrorMessage('Location permission denied. Enable it in device settings.');
        return;
      }

      const currentPosition = await locationModule.getCurrentPositionAsync({
        accuracy: locationModule.Accuracy.Balanced,
      });
      setLocation(normalizeLocation(currentPosition));

      watcherRef.current?.remove();
      watcherRef.current = await locationModule.watchPositionAsync(
        {
          accuracy: locationModule.Accuracy.BestForNavigation,
          distanceInterval: 5,
          timeInterval: 2000,
        },
        (nextLocation) => {
          setLocation(normalizeLocation(nextLocation));
        },
      );

      setTrackingState('tracking');
    } catch (error) {
      setTrackingState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start location tracking.');
    }
  }, [locationModule]);

  useEffect(() => () => watcherRef.current?.remove(), []);

  return {
    location,
    trackingState,
    errorMessage,
    isSupported: Boolean(locationModule),
    startTracking,
    stopTracking,
  };
}
