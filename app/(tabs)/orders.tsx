import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ActionButton, Field, OrderStatusPill, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';
import type { MessageSender } from '@/types/agri';

const chatSenders: MessageSender[] = ['buyer', 'farmer', 'driver'];

export default function OrdersScreen() {
  const { listings, orders, chatMessages, placeOrder, addChatMessage, advanceOrderStatus } = useAgri();

  const orderableListings = useMemo(
    () => listings.filter((listing) => listing.status !== 'sold' && listing.quantityKg > 0),
    [listings],
  );

  const [selectedListingId, setSelectedListingId] = useState<string>(orderableListings[0]?.id ?? '');
  const [buyerName, setBuyerName] = useState('City Traders');
  const [buyerContact, setBuyerContact] = useState('+254 711 000 111');
  const [quantityKg, setQuantityKg] = useState('100');
  const [pickupLocation, setPickupLocation] = useState('Farm pickup point');
  const [dropoffLocation, setDropoffLocation] = useState('Urban collection center');

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id ?? '');
  const [chatSender, setChatSender] = useState<MessageSender>('buyer');
  const [chatBody, setChatBody] = useState('');

  const selectedOrderMessages = useMemo(
    () => chatMessages.filter((message) => message.orderId === selectedOrderId),
    [chatMessages, selectedOrderId],
  );

  useEffect(() => {
    if (!orderableListings.length) {
      setSelectedListingId('');
      return;
    }

    if (!orderableListings.some((listing) => listing.id === selectedListingId)) {
      setSelectedListingId(orderableListings[0].id);
    }
  }, [orderableListings, selectedListingId]);

  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId('');
      return;
    }

    if (!orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  const submitOrder = () => {
    const parsedQuantity = Number(quantityKg);
    const selectedListing = orderableListings.find((listing) => listing.id === selectedListingId);

    if (
      !selectedListingId ||
      !selectedListing ||
      !buyerName.trim() ||
      !buyerContact.trim() ||
      !parsedQuantity ||
      parsedQuantity > selectedListing.quantityKg
    ) {
      return;
    }

    placeOrder({
      listingId: selectedListingId,
      buyerName: buyerName.trim(),
      buyerContact: buyerContact.trim(),
      quantityKg: parsedQuantity,
      pickupLocation: pickupLocation.trim() || 'Farm gate',
      dropoffLocation: dropoffLocation.trim() || 'Buyer warehouse',
    });

    setQuantityKg('');
  };

  return (
    <ScreenShell
      title="Orders & Negotiation"
      subtitle="Buyers place orders directly from listings and negotiate terms in per-order chat.">
      <SectionCard>
        <Text style={styles.sectionTitle}>Create buyer order</Text>

        <Text style={styles.fieldLabel}>Select listing</Text>
        <View style={styles.optionRow}>
          {orderableListings.map((listing) => (
            <Pressable
              key={listing.id}
              onPress={() => setSelectedListingId(listing.id)}
              style={[
                styles.optionPill,
                selectedListingId === listing.id ? styles.optionPillActive : null,
              ]}>
              <Text
                style={[
                  styles.optionPillText,
                  selectedListingId === listing.id ? styles.optionPillTextActive : null,
                ]}>
                {listing.cropName} ({listing.quantityKg.toFixed(0)} kg)
              </Text>
            </Pressable>
          ))}
        </View>

        <Field label="Buyer name" value={buyerName} onChangeText={setBuyerName} placeholder="Buyer" />
        <Field
          label="Buyer contact"
          value={buyerContact}
          onChangeText={setBuyerContact}
          placeholder="+254 ..."
        />
        <Field
          label="Order quantity (kg)"
          value={quantityKg}
          onChangeText={setQuantityKg}
          keyboardType="numeric"
          placeholder="100"
        />
        <Field
          label="Pickup location"
          value={pickupLocation}
          onChangeText={setPickupLocation}
          placeholder="Farm location"
        />
        <Field
          label="Dropoff location"
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
          placeholder="Buyer location"
        />

        <ActionButton label="Place order" onPress={submitOrder} disabled={!orderableListings.length} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => setSelectedOrderId(order.id)}
            style={[
              styles.orderItem,
              selectedOrderId === order.id ? styles.orderItemSelected : null,
            ]}>
            <View style={styles.rowSpread}>
              <Text style={styles.orderTitle}>
                {order.cropName} - {order.quantityKg} kg
              </Text>
              <OrderStatusPill status={order.status} />
            </View>
            <Text style={styles.orderMeta}>Buyer: {order.buyerName}</Text>
            <Text style={styles.orderMeta}>
              Pickup: {order.pickupLocation} {'->'} {order.dropoffLocation}
            </Text>
            <Text style={styles.orderMeta}>Total: ${order.totalPrice.toFixed(2)}</Text>
            <ActionButton label="Advance status" onPress={() => advanceOrderStatus(order.id)} variant="secondary" />
          </Pressable>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Negotiation chat</Text>
        <Text style={styles.caption}>Select an order above to open conversation.</Text>

        <Text style={styles.fieldLabel}>Sender</Text>
        <View style={styles.optionRow}>
          {chatSenders.map((sender) => (
            <Pressable
              key={sender}
              onPress={() => setChatSender(sender)}
              style={[
                styles.optionPill,
                chatSender === sender ? styles.optionPillActive : null,
              ]}>
              <Text
                style={[
                  styles.optionPillText,
                  chatSender === sender ? styles.optionPillTextActive : null,
                ]}>
                {sender}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field
          label="Message"
          value={chatBody}
          onChangeText={setChatBody}
          placeholder="Type delivery timing, quality checks, or price updates"
          multiline
          numberOfLines={3}
          style={styles.chatInput}
        />

        <ActionButton
          label="Send message"
          onPress={() => {
            if (!selectedOrderId) return;
            addChatMessage(selectedOrderId, chatSender, chatBody);
            setChatBody('');
          }}
          disabled={!selectedOrderId}
        />

        {selectedOrderMessages.length ? (
          selectedOrderMessages.map((message) => (
            <View key={message.id} style={styles.messageItem}>
              <Text style={styles.messageSender}>{message.sender}</Text>
              <Text style={styles.messageBody}>{message.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.caption}>No messages for this order yet.</Text>
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
  caption: {
    fontSize: 13,
    color: '#607565',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f4636',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    backgroundColor: '#edf4eb',
    borderWidth: 1,
    borderColor: '#d4dfd0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  optionPillActive: {
    backgroundColor: '#1f7d3f',
    borderColor: '#1f7d3f',
  },
  optionPillText: {
    color: '#3f5945',
    fontSize: 12,
    fontWeight: '700',
  },
  optionPillTextActive: {
    color: '#ffffff',
  },
  orderItem: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#e1ebdc',
    borderRadius: 10,
    padding: 10,
  },
  orderItemSelected: {
    borderColor: '#257b46',
    backgroundColor: '#f4faf2',
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderTitle: {
    color: '#1a3623',
    fontSize: 14,
    fontWeight: '700',
  },
  orderMeta: {
    color: '#59705e',
    fontSize: 12,
  },
  chatInput: {
    minHeight: 78,
    textAlignVertical: 'top',
  },
  messageItem: {
    backgroundColor: '#f5f9f4',
    borderWidth: 1,
    borderColor: '#dfe9db',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  messageSender: {
    fontSize: 12,
    color: '#1e6938',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  messageBody: {
    fontSize: 13,
    color: '#34503b',
    lineHeight: 18,
  },
});
