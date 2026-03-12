import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ui } from '@/components/agri/theme';
import type { GpsCheckpoint } from '@/types/agri';

type LatLng = { latitude: number; longitude: number };

type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

type RouteMapProps = {
  checkpoints: GpsCheckpoint[];
  currentCheckpointIndex: number;
  liveLocation?: LiveLocation | null;
};

type MapsModule = {
  MapView: any;
  Marker: any;
  Polyline: any;
  Circle: any;
};

const getMapsModule = (): MapsModule | null => {
  if (Platform.OS === 'web') return null;

  // Avoid importing native modules on web.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const maps = require('react-native-maps');

  return {
    MapView: maps.default,
    Marker: maps.Marker,
    Polyline: maps.Polyline,
    Circle: maps.Circle,
  };
};

const toLatLng = (point: LatLng) => ({ latitude: point.latitude, longitude: point.longitude });

const regionFromCoordinates = (points: LatLng[]) => {
  if (!points.length) {
    return {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }

  const latitudes = points.map((p) => p.latitude);
  const longitudes = points.map((p) => p.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;

  const latitudeDelta = Math.max((maxLat - minLat) * 1.6, 0.02);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.6, 0.02);

  return { latitude, longitude, latitudeDelta, longitudeDelta };
};

const PlaceholderMap = ({
  checkpoints,
  currentCheckpointIndex,
  liveLocation,
}: RouteMapProps) => {
  type Point = GpsCheckpoint & {
    x: number;
    y: number;
  };

  const fallbackPoints = useMemo<Point[]>(() => {
    if (!checkpoints.length) return [];

    const latValues = checkpoints.map((point) => point.latitude);
    const lngValues = checkpoints.map((point) => point.longitude);

    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    return checkpoints.map((point) => ({
      ...point,
      x: 8 + ((point.longitude - minLng) / lngRange) * 84,
      y: 90 - ((point.latitude - minLat) / latRange) * 80,
    }));
  }, [checkpoints]);

  const livePoint = useMemo(() => {
    if (!liveLocation || !checkpoints.length) return null;

    const latValues = checkpoints.map((point) => point.latitude);
    const lngValues = checkpoints.map((point) => point.longitude);

    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLng = Math.min(...lngValues);
    const maxLng = Math.max(...lngValues);

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    return {
      x: 8 + ((liveLocation.longitude - minLng) / lngRange) * 84,
      y: 90 - ((liveLocation.latitude - minLat) / latRange) * 80,
      ...liveLocation,
    };
  }, [checkpoints, liveLocation]);

  if (!checkpoints.length) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyText}>Create transport to start GPS route tracking.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <View style={styles.gridHorizontalTop} />
      <View style={styles.gridHorizontalBottom} />
      <View style={styles.gridVerticalLeft} />
      <View style={styles.gridVerticalRight} />

      {fallbackPoints.map((point, index) => {
        const reached = index <= currentCheckpointIndex;
        const current = index === currentCheckpointIndex;

        return (
          <View
            key={point.id}
            style={[
              styles.point,
              {
                left: `${point.x}%`,
                top: `${point.y}%`,
                backgroundColor: reached ? ui.primary : '#cbd7ce',
                borderColor: current ? '#d89b3f' : '#ffffff',
              },
            ]}
          />
        );
      })}

      {livePoint ? (
        <View
          style={[
            styles.livePoint,
            {
              left: `${livePoint.x}%`,
              top: `${livePoint.y}%`,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

export function GpsRouteMap({ checkpoints, currentCheckpointIndex, liveLocation }: RouteMapProps) {
  const maps = useMemo(() => getMapsModule(), []);
  const mapRef = useRef<any>(null);

  const routeCoordinates = useMemo<LatLng[]>(
    () => checkpoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
    [checkpoints],
  );

  const liveCoordinate = useMemo<LatLng | null>(() => {
    if (!liveLocation) return null;
    return { latitude: liveLocation.latitude, longitude: liveLocation.longitude };
  }, [liveLocation]);

  const visibleCoordinates = useMemo<LatLng[]>(() => {
    if (!routeCoordinates.length) return liveCoordinate ? [liveCoordinate] : [];
    if (!liveCoordinate) return routeCoordinates;
    return [...routeCoordinates, liveCoordinate];
  }, [liveCoordinate, routeCoordinates]);

  useEffect(() => {
    if (!maps || !mapRef.current) return;
    if (!visibleCoordinates.length) return;

    // Fit the route + live marker into view.
    try {
      mapRef.current.fitToCoordinates(visibleCoordinates.map(toLatLng), {
        edgePadding: { top: 36, right: 36, bottom: 36, left: 36 },
        animated: true,
      });
    } catch {
      // Some runtimes can throw before initial layout; ignore and rely on initialRegion.
    }
  }, [maps, visibleCoordinates]);

  return (
    <View style={styles.wrap}>
      <View style={styles.mapContainer}>
        {maps && routeCoordinates.length ? (
          <maps.MapView
            ref={mapRef}
            style={styles.nativeMap}
            initialRegion={regionFromCoordinates(visibleCoordinates)}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}>
            <maps.Polyline
              coordinates={routeCoordinates.map(toLatLng)}
              strokeColor="#a9b8ae"
              strokeWidth={4}
            />

            {routeCoordinates.length && currentCheckpointIndex >= 0 ? (
              <maps.Polyline
                coordinates={routeCoordinates
                  .slice(0, Math.min(currentCheckpointIndex + 1, routeCoordinates.length))
                  .map(toLatLng)}
                strokeColor={ui.primary}
                strokeWidth={5}
              />
            ) : null}

            {checkpoints.map((point, index) => {
              const reached = index <= currentCheckpointIndex;
              const current = index === currentCheckpointIndex;

              return (
                <maps.Marker
                  key={point.id}
                  coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                  title={point.name}
                  pinColor={current ? '#d89b3f' : reached ? ui.primary : '#7c8d81'}
                />
              );
            })}

            {liveCoordinate ? (
              <>
                {typeof liveLocation?.accuracy === 'number' && liveLocation.accuracy > 0 ? (
                  <maps.Circle
                    center={toLatLng(liveCoordinate)}
                    radius={Math.min(Math.max(liveLocation.accuracy, 8), 120)}
                    strokeColor="rgba(220, 76, 63, 0.35)"
                    fillColor="rgba(220, 76, 63, 0.15)"
                  />
                ) : null}
                <maps.Marker
                  coordinate={toLatLng(liveCoordinate)}
                  title="Live driver location"
                  pinColor="#dc4c3f"
                />
              </>
            ) : null}
          </maps.MapView>
        ) : (
          <PlaceholderMap
            checkpoints={checkpoints}
            currentCheckpointIndex={currentCheckpointIndex}
            liveLocation={liveLocation}
          />
        )}
      </View>

      <View style={styles.legendWrap}>
        {checkpoints.map((point, index) => {
          const reached = index <= currentCheckpointIndex;
          return (
            <View key={point.id} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: reached ? ui.primary : '#c9d5c8' }]} />
              <Text style={styles.legendName}>{point.name}</Text>
              <Text style={styles.legendCoords}>
                {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
              </Text>
            </View>
          );
        })}

        {liveLocation ? (
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#dc4c3f' }]} />
            <Text style={styles.legendName}>Live driver location</Text>
            <Text style={styles.legendCoords}>
              {liveLocation.latitude.toFixed(4)}, {liveLocation.longitude.toFixed(4)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  mapContainer: {
    height: 210,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    backgroundColor: '#eef4ee',
    overflow: 'hidden',
    position: 'relative',
  },
  nativeMap: {
    ...StyleSheet.absoluteFillObject,
  },
  gridHorizontalTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    borderTopWidth: 1,
    borderTopColor: '#dce7de',
  },
  gridHorizontalBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    borderTopWidth: 1,
    borderTopColor: '#dce7de',
  },
  gridVerticalLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    borderLeftWidth: 1,
    borderLeftColor: '#dce7de',
  },
  gridVerticalRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    borderLeftWidth: 1,
    borderLeftColor: '#dce7de',
  },
  point: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    borderRadius: 999,
    borderWidth: 2,
  },
  legendWrap: {
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendName: {
    flex: 1,
    fontSize: 12,
    color: '#314a39',
  },
  legendCoords: {
    fontSize: 10,
    color: '#809082',
  },
  emptyMap: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    backgroundColor: ui.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  emptyText: {
    fontSize: 12,
    color: ui.textMuted,
    textAlign: 'center',
  },
  livePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 999,
    backgroundColor: '#dc4c3f',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
