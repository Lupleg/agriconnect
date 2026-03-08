import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ui } from '@/components/agri/theme';
import type { GpsCheckpoint } from '@/types/agri';

const mapsModule = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-maps');
  } catch {
    return null;
  }
})();

const MapView = mapsModule?.default;
const Marker = mapsModule?.Marker;
const Polyline = mapsModule?.Polyline;

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

type Point = GpsCheckpoint & {
  x: number;
  y: number;
};

const buildRegion = (coordinates: { latitude: number; longitude: number }[]) => {
  if (!coordinates.length) {
    return {
      latitude: -1.2864,
      longitude: 36.8172,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const latitudes = coordinates.map((point) => point.latitude);
  const longitudes = coordinates.map((point) => point.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.02),
  };
};

export function GpsRouteMap({ checkpoints, currentCheckpointIndex, liveLocation }: RouteMapProps) {
  const routeCoordinates = useMemo(
    () => checkpoints.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
    [checkpoints],
  );

  const completeCoordinates = useMemo(
    () => routeCoordinates.slice(0, Math.min(currentCheckpointIndex + 1, routeCoordinates.length)),
    [routeCoordinates, currentCheckpointIndex],
  );

  const mapRegion = useMemo(() => {
    const coordinates = liveLocation ? [liveLocation, ...routeCoordinates] : routeCoordinates;
    return buildRegion(coordinates);
  }, [liveLocation, routeCoordinates]);

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

  if (!checkpoints.length) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyText}>Create transport to start GPS route tracking.</Text>
      </View>
    );
  }

  const canRenderNativeMap = Boolean(MapView && Marker && Polyline && Platform.OS !== 'web');

  return (
    <View style={styles.wrap}>
      {canRenderNativeMap ? (
        <MapView style={styles.map} region={mapRegion}>
          {routeCoordinates.length > 1 ? (
            <Polyline coordinates={routeCoordinates} strokeColor="#8ca495" strokeWidth={3} />
          ) : null}
          {completeCoordinates.length > 1 ? (
            <Polyline coordinates={completeCoordinates} strokeColor={ui.primary} strokeWidth={4} />
          ) : null}

          {checkpoints.map((point, index) => (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              title={point.name}
              pinColor={index <= currentCheckpointIndex ? ui.primary : '#9eaea3'}
            />
          ))}

          {liveLocation ? (
            <Marker
              coordinate={{ latitude: liveLocation.latitude, longitude: liveLocation.longitude }}
              title="Live driver location"
              description={
                liveLocation.accuracy ? `Approx. ±${Math.round(liveLocation.accuracy)}m` : undefined
              }
              pinColor="#dc4c3f"
            />
          ) : null}
        </MapView>
      ) : (
        <View style={styles.map}>
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
        </View>
      )}

      {!canRenderNativeMap ? (
        <Text style={styles.noteText}>
          Install `react-native-maps` to render map tiles and native markers.
        </Text>
      ) : null}

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
  map: {
    height: 210,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    backgroundColor: '#eef4ee',
    overflow: 'hidden',
    position: 'relative',
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
  noteText: {
    fontSize: 11,
    color: '#8a9b8f',
  },
});
