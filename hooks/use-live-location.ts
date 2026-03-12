import * as Location from 'expo-location';
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

type WebGeolocation = {
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error?: (error: GeolocationPositionError) => void,
    options?: PositionOptions,
  ) => void;
  watchPosition: (
    success: (position: GeolocationPosition) => void,
    error?: (error: GeolocationPositionError) => void,
    options?: PositionOptions,
  ) => number;
  clearWatch: (watchId: number) => void;
};

const getWebGeolocation = (): WebGeolocation | null => {
  const navigatorMaybe = globalThis.navigator as Navigator | undefined;
  return (navigatorMaybe?.geolocation as WebGeolocation | undefined) ?? null;
};

const normalizeExpoLocation = (location: Location.LocationObject): LiveLocationPoint => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy ?? null,
  heading: location.coords.heading ?? null,
  speed: location.coords.speed ?? null,
  timestamp: typeof location.timestamp === 'number' ? location.timestamp : Date.now(),
});

const normalizeWebLocation = (location: GeolocationPosition): LiveLocationPoint => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy ?? null,
  heading: location.coords.heading ?? null,
  speed: location.coords.speed ?? null,
  timestamp: typeof location.timestamp === 'number' ? location.timestamp : Date.now(),
});

const isWebRuntime = () => typeof document !== 'undefined';

export function useLiveLocation() {
  const webGeolocation = useMemo(() => (isWebRuntime() ? getWebGeolocation() : null), []);
  const expoSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const webWatcherRef = useRef<number | null>(null);

  const [trackingState, setTrackingState] = useState<TrackingState>(
    'idle',
  );
  const [location, setLocation] = useState<LiveLocationPoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopTracking = useCallback(() => {
    if (expoSubscriptionRef.current) {
      expoSubscriptionRef.current.remove();
      expoSubscriptionRef.current = null;
    }

    if (webWatcherRef.current !== null && webGeolocation) {
      webGeolocation.clearWatch(webWatcherRef.current);
      webWatcherRef.current = null;
    }

    setTrackingState('idle');
  }, [webGeolocation]);

  const startTracking = useCallback(async () => {
    setTrackingState('requesting');
    setErrorMessage(null);

    try {
      // Prefer expo-location on native runtimes and when available on web.
      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!servicesEnabled) {
        setTrackingState('error');
        setErrorMessage('Location services are disabled. Enable GPS/location services and try again.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setTrackingState('denied');
        setErrorMessage('Location permission denied. Enable it in device settings.');
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(normalizeExpoLocation(current));

      if (expoSubscriptionRef.current) {
        expoSubscriptionRef.current.remove();
      }

      expoSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2500,
          distanceInterval: 5,
        },
        (nextLocation) => {
          setLocation(normalizeExpoLocation(nextLocation));
          setTrackingState('tracking');
        },
      );

      setTrackingState('tracking');
    } catch (error) {
      // Some web environments (or restricted contexts) might still need navigator.geolocation.
      if (isWebRuntime() && webGeolocation) {
        try {
          await new Promise<void>((resolve, reject) => {
            webGeolocation.getCurrentPosition(
              (currentPosition) => {
                setLocation(normalizeWebLocation(currentPosition));
                resolve();
              },
              (webError) => reject(webError),
              { enableHighAccuracy: true, timeout: 12000, maximumAge: 1000 },
            );
          });

          if (webWatcherRef.current !== null) {
            webGeolocation.clearWatch(webWatcherRef.current);
          }

          webWatcherRef.current = webGeolocation.watchPosition(
            (nextLocation) => {
              setLocation(normalizeWebLocation(nextLocation));
              setTrackingState('tracking');
            },
            (watchError) => {
              if (watchError?.code === 1) {
                setTrackingState('denied');
                setErrorMessage('Location permission denied. Enable it in browser settings.');
                return;
              }

              setTrackingState('error');
              setErrorMessage(watchError?.message || 'Unable to keep tracking live location.');
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 1000 },
          );

          setTrackingState('tracking');
          return;
        } catch (webFallbackError) {
          setTrackingState('error');
          setErrorMessage(
            webFallbackError instanceof Error
              ? webFallbackError.message
              : 'Unable to start location tracking.',
          );
          return;
        }
      }

      setTrackingState('unsupported');
      setErrorMessage(
        error instanceof Error ? error.message : 'Location tracking is not available in this runtime.',
      );
    }
  }, [webGeolocation]);

  useEffect(
    () => () => {
      if (expoSubscriptionRef.current) {
        expoSubscriptionRef.current.remove();
        expoSubscriptionRef.current = null;
      }

      if (webWatcherRef.current !== null && webGeolocation) {
        webGeolocation.clearWatch(webWatcherRef.current);
        webWatcherRef.current = null;
      }
    },
    [webGeolocation],
  );

  return {
    location,
    trackingState,
    errorMessage,
    isSupported: trackingState !== 'unsupported',
    startTracking,
    stopTracking,
  };
}
