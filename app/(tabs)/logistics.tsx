import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GpsRouteMap } from '@/components/agri/gps-route-map';
import { ScreenShell } from '@/components/agri/screen-shell';
import { ActionButton, Field, OrderStatusPill, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';

export default function LogisticsScreen() {
  const { orders, transportRequests, upsertTransportRequest, advanceOrderStatus } = useAgri();

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
  }, [selectedOrder, selectedTransport]);

  return (
    <ScreenShell
      title="Transport & Tracking"
      subtitle="Assign drivers, set delivery fee, and monitor GPS checkpoints by order status.">
      <SectionCard>
        <Text style={styles.sectionTitle}>Choose order</Text>

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
        <Text style={styles.sectionTitle}>Transport coordination</Text>
        <Field
          label="Driver name"
          value={driverName}
          onChangeText={setDriverName}
          placeholder="e.g. Peter Njoroge"
        />
        <Field
          label="Vehicle plate"
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          placeholder="KDA 314X"
          autoCapitalize="characters"
        />
        <Field
          label="Pickup details"
          value={pickupDetails}
          onChangeText={setPickupDetails}
          placeholder="Farm gate, loading zone"
        />
        <Field
          label="Dropoff details"
          value={dropoffDetails}
          onChangeText={setDropoffDetails}
          placeholder="Warehouse, receiving dock"
        />
        <Field
          label="Delivery fee (USD)"
          value={deliveryFee}
          onChangeText={setDeliveryFee}
          keyboardType="numeric"
          placeholder="40"
        />

        <ActionButton
          label={selectedTransport ? 'Update transport request' : 'Create transport request'}
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
          }}
          disabled={!selectedOrder}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>GPS map tracking</Text>
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
            <GpsRouteMap
              checkpoints={selectedTransport.checkpoints}
              currentCheckpointIndex={selectedTransport.currentCheckpointIndex}
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
    fontSize: 16,
    fontWeight: '700',
    color: '#183121',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#d5dfd2',
    backgroundColor: '#eef4eb',
  },
  orderPillActive: {
    backgroundColor: '#257b46',
    borderColor: '#257b46',
  },
  orderPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#415c48',
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
    fontSize: 13,
    color: '#607666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    color: '#203b2a',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 13,
    color: '#607666',
  },
});
