import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { GpsCheckpoint } from '@/types/agri';

type RouteMapProps = {
  checkpoints: GpsCheckpoint[];
  currentCheckpointIndex: number;
};

type Point = GpsCheckpoint & {
  x: number;
  y: number;
};

export function GpsRouteMap({ checkpoints, currentCheckpointIndex }: RouteMapProps) {
  const points = useMemo<Point[]>(() => {
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

  if (!points.length) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyText}>Create transport to start GPS route tracking.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.map}>
        <View style={styles.gridHorizontalTop} />
        <View style={styles.gridHorizontalBottom} />
        <View style={styles.gridVerticalLeft} />
        <View style={styles.gridVerticalRight} />

        {points.map((point, index) => {
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
                  backgroundColor: reached ? '#19713a' : '#c9d5c8',
                  borderColor: current ? '#f59e0b' : '#ffffff',
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.legendWrap}>
        {points.map((point, index) => {
          const reached = index <= currentCheckpointIndex;
          return (
            <View key={point.id} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: reached ? '#19713a' : '#c9d5c8' }]} />
              <Text style={styles.legendName}>{point.name}</Text>
              <Text style={styles.legendCoords}>
                {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  map: {
    height: 190,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cad9cb',
    backgroundColor: '#eef7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  gridHorizontalTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    borderTopWidth: 1,
    borderTopColor: '#d8e6d8',
  },
  gridHorizontalBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    borderTopWidth: 1,
    borderTopColor: '#d8e6d8',
  },
  gridVerticalLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    borderLeftWidth: 1,
    borderLeftColor: '#d8e6d8',
  },
  gridVerticalRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    borderLeftWidth: 1,
    borderLeftColor: '#d8e6d8',
  },
  point: {
    position: 'absolute',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
    borderRadius: 999,
    borderWidth: 2,
  },
  legendWrap: {
    gap: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    color: '#284230',
  },
  legendCoords: {
    fontSize: 11,
    color: '#708272',
  },
  emptyMap: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cad9cb',
    backgroundColor: '#f6faf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#5f735f',
    textAlign: 'center',
  },
});
