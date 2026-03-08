import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GpsRouteMap } from '@/components/agri/gps-route-map';
import { ScreenShell } from '@/components/agri/screen-shell';
import { ui } from '@/components/agri/theme';
import { ActionButton, Field, OrderStatusPill, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';
import { useLiveLocation } from '@/hooks/use-live-location';

const distanceKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

export default function LogisticsScreen() {
  const { orders, transportRequests, upsertTransportRequest, advanceOrderStatus } = useAgri();
  const { location, trackingState, errorMessage, isSupported, startTracking, stopTracking } =
    useLiveLocation();

  const [showTransportEditor, setShowTransportEditor] = useState(false);
  const [showAdvancedRoute, setShowAdvancedRoute] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id ?? '');
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [pickupDetails, setPickupDetails] = useState('');
  const [dropoffDetails, setDropoffDetails] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  const selectedTransport = useMemo(
    () => transportRequests.find((request) => request.orderId === selectedOrderId),
    [selectedOrderId, transportRequests],
  );

  const remainingDistance = useMemo(() => {
    if (!location || !selectedTransport?.checkpoints.length) return null;

    const finalCheckpoint = selectedTransport.checkpoints[selectedTransport.checkpoints.length - 1];
    return distanceKm(location, {
      latitude: finalCheckpoint.latitude,
      longitude: finalCheckpoint.longitude,
    });
  }, [location, selectedTransport]);

  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId('');
      return;
    }

    if (!orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder) return;

    setDriverName(selectedTransport?.driverName ?? '');
    setVehiclePlate(selectedTransport?.vehiclePlate ?? '');
    setPickupDetails(selectedTransport?.pickupDetails ?? selectedOrder.pickupLocation);
    setDropoffDetails(selectedTransport?.dropoffDetails ?? selectedOrder.dropoffLocation);
    setDeliveryFee(selectedTransport ? String(selectedTransport.deliveryFee) : '');
    setShowTransportEditor(!selectedTransport);
    setShowAdvancedRoute(false);
  }, [selectedOrder, selectedTransport]);

  return (
    <ScreenShell
      title="Logistics"
      subtitle="Assign transport, then turn on live driver tracking only when dispatch starts.">
      <SectionCard>
        <Text style={styles.sectionTitle}>Select order</Text>

        <View style={styles.optionWrap}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => setSelectedOrderId(order.id)}
              style={[
                styles.orderPill,
                selectedOrderId === order.id ? styles.orderPillActive : null,
              ]}>
              <Text
                style={[
                  styles.orderPillText,
                  selectedOrderId === order.id ? styles.orderPillTextActive : null,
                ]}>
                {order.cropName} ({order.quantityKg} kg)
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedOrder ? (
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Buyer</Text>
              <Text style={styles.summaryValue}>{selectedOrder.buyerName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Route</Text>
              <Text style={styles.summaryValue}>
                {selectedOrder.pickupLocation} {'->'} {selectedOrder.dropoffLocation}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <OrderStatusPill status={selectedOrder.status} />
            </View>
            <ActionButton
              label="Advance order status"
              onPress={() => advanceOrderStatus(selectedOrder.id)}
              variant="secondary"
            />
          </View>
        ) : null}
      </SectionCard>

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Transport request</Text>
          <Pressable
            style={styles.ghostButton}
            onPress={() => setShowTransportEditor((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showTransportEditor ? 'Close' : 'Edit'}</Text>
          </Pressable>
        </View>

        {showTransportEditor ? (
          <>
            <Field
              label="Driver name"
              value={driverName}
              onChangeText={setDriverName}
              placeholder="Peter Njoroge"
            />
            <View style={styles.splitRow}>
              <View style={styles.splitCol}>
                <Field
                  label="Vehicle plate"
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                  placeholder="KDA 314X"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.splitCol}>
                <Field
                  label="Delivery fee (USD)"
                  value={deliveryFee}
                  onChangeText={setDeliveryFee}
                  keyboardType="numeric"
                  placeholder="40"
                />
              </View>
            </View>

            <Pressable
              style={styles.inlineToggle}
              onPress={() => setShowAdvancedRoute((current) => !current)}>
              <Text style={styles.inlineToggleText}>
                {showAdvancedRoute ? 'Hide route details' : 'Edit route details'}
              </Text>
            </Pressable>

            {showAdvancedRoute ? (
              <>
                <Field
                  label="Pickup details"
                  value={pickupDetails}
                  onChangeText={setPickupDetails}
                  placeholder="Farm gate"
                />
                <Field
                  label="Dropoff details"
                  value={dropoffDetails}
                  onChangeText={setDropoffDetails}
                  placeholder="Warehouse"
                />
              </>
            ) : null}

            <ActionButton
              label={selectedTransport ? 'Update transport' : 'Create transport'}
              onPress={() => {
                if (!selectedOrder) return;

                upsertTransportRequest({
                  orderId: selectedOrder.id,
                  driverName: driverName.trim() || 'Unassigned driver',
                  vehiclePlate: vehiclePlate.trim() || 'Unassigned vehicle',
                  pickupDetails: pickupDetails.trim() || selectedOrder.pickupLocation,
                  dropoffDetails: dropoffDetails.trim() || selectedOrder.dropoffLocation,
                  deliveryFee: Number(deliveryFee) || 0,
                });

                setShowTransportEditor(false);
                setShowAdvancedRoute(false);
              }}
              disabled={!selectedOrder}
            />
          </>
        ) : (
          <Text style={styles.helperText}>Open Edit when you need to update driver or fees.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>GPS tracking</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Device tracking</Text>
          <Text style={styles.summaryValue}>{trackingState}</Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {!isSupported ? (
          <Text style={styles.helperText}>Install `expo-location` to enable live device tracking.</Text>
        ) : null}

        <ActionButton
          label={trackingState === 'tracking' ? 'Stop live tracking' : 'Start live tracking'}
          onPress={trackingState === 'tracking' ? stopTracking : startTracking}
          variant={trackingState === 'tracking' ? 'secondary' : 'primary'}
          disabled={!selectedTransport}
        />

        {!selectedTransport ? (
          <Text style={styles.helperText}>Create transport first to visualize route tracking.</Text>
        ) : null}

        {selectedTransport ? (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Driver</Text>
              <Text style={styles.summaryValue}>
                {selectedTransport.driverName} ({selectedTransport.vehiclePlate})
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>${selectedTransport.deliveryFee.toFixed(2)}</Text>
            </View>
            {remainingDistance !== null ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Distance to dropoff</Text>
                <Text style={styles.summaryValue}>{remainingDistance.toFixed(2)} km</Text>
              </View>
            ) : null}

            <GpsRouteMap
              checkpoints={selectedTransport.checkpoints}
              currentCheckpointIndex={selectedTransport.currentCheckpointIndex}
              liveLocation={location}
            />
          </>
        ) : (
          <Text style={styles.emptyText}>No transport request created for this order yet.</Text>
        )}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ui.heading,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ghostButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: ui.primarySoft,
    borderRadius: 999,
  },
  ghostButtonText: {
    fontSize: 11,
    color: ui.primary,
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitCol: {
    flex: 1,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d8e3d7',
    backgroundColor: '#edf3ec',
  },
  orderPillActive: {
    backgroundColor: ui.primary,
    borderColor: ui.primary,
  },
  orderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#495f4f',
  },
  orderPillTextActive: {
    color: '#ffffff',
  },
  summaryBlock: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: ui.textMuted,
    flex: 1,
  },
  summaryValue: {
    fontSize: 12,
    color: ui.heading,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  inlineToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f1f6ef',
    borderWidth: 1,
    borderColor: '#dce7d8',
  },
  inlineToggleText: {
    fontSize: 11,
    color: '#4e6554',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    color: ui.danger,
  },
  helperText: {
    fontSize: 12,
    color: ui.textMuted,
  },
  emptyText: {
    fontSize: 12,
    color: ui.textMuted,
  },
});
