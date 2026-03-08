import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ui } from '@/components/agri/theme';
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
                  backgroundColor: reached ? ui.primary : '#cbd7ce',
                  borderColor: current ? '#d89b3f' : '#ffffff',
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
    height: 184,
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
});
