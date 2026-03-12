import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ui } from '@/components/agri/theme';
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

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAdvancedOrderFields, setShowAdvancedOrderFields] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [selectedListingId, setSelectedListingId] = useState<string>(orderableListings[0]?.id ?? '');
  const [buyerName, setBuyerName] = useState('Lusaka City Traders');
  const [buyerContact, setBuyerContact] = useState('+260 97 000 2222');
  const [quantityKg, setQuantityKg] = useState('100');
  const [pickupLocation, setPickupLocation] = useState('Farm gate (e.g., Mkushi)');
  const [dropoffLocation, setDropoffLocation] = useState('Buyer depot (e.g., Lusaka)');

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
    setShowOrderForm(false);
    setShowAdvancedOrderFields(false);
  };

  return (
    <ScreenShell
      title="Orders"
      subtitle="Streamlined view: expand forms only when you need to create or negotiate.">
      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>New order</Text>
          <Pressable style={styles.ghostButton} onPress={() => setShowOrderForm((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showOrderForm ? 'Close' : 'Create'}</Text>
          </Pressable>
        </View>

        {showOrderForm ? (
          <>
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
              placeholder="+260 ..."
            />
            <Field
              label="Quantity (kg)"
              value={quantityKg}
              onChangeText={setQuantityKg}
              keyboardType="numeric"
              placeholder="100"
            />

            <Pressable
              style={styles.inlineToggle}
              onPress={() => setShowAdvancedOrderFields((current) => !current)}>
              <Text style={styles.inlineToggleText}>
                {showAdvancedOrderFields ? 'Hide route fields' : 'Add route fields'}
              </Text>
            </Pressable>

            {showAdvancedOrderFields ? (
              <>
                <Field
                  label="Pickup"
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  placeholder="Farm location"
                />
                <Field
                  label="Dropoff"
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                  placeholder="Buyer location"
                />
              </>
            ) : null}

            <ActionButton label="Place order" onPress={submitOrder} disabled={!orderableListings.length} />
          </>
        ) : (
          <Text style={styles.helperText}>Use Create to place a new buyer order.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Orders ({orders.length})</Text>
        {orders.map((order) => {
          const selected = selectedOrderId === order.id;

          return (
            <Pressable
              key={order.id}
              onPress={() => setSelectedOrderId(order.id)}
              style={[styles.orderItem, selected ? styles.orderItemSelected : null]}>
              <View style={styles.rowSpread}>
                <Text style={styles.orderTitle}>
                  {order.cropName} · {order.quantityKg} kg
                </Text>
                <OrderStatusPill status={order.status} />
              </View>

              {selected ? (
                <>
                  <Text style={styles.orderMeta}>Buyer: {order.buyerName}</Text>
                  <Text style={styles.orderMeta}>
                    {order.pickupLocation} {'->'} {order.dropoffLocation}
                  </Text>
                  <Text style={styles.orderMeta}>Total: ${order.totalPrice.toFixed(2)}</Text>
                  <ActionButton
                    label="Advance status"
                    onPress={() => advanceOrderStatus(order.id)}
                    variant="secondary"
                  />
                </>
              ) : (
                <Text style={styles.helperText}>Tap to expand order actions</Text>
              )}
            </Pressable>
          );
        })}
      </SectionCard>

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Negotiation chat</Text>
          <Pressable style={styles.ghostButton} onPress={() => setShowChat((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showChat ? 'Close' : 'Open'}</Text>
          </Pressable>
        </View>

        {showChat ? (
          <>
            <Text style={styles.caption}>Selected order thread only.</Text>

            <Text style={styles.fieldLabel}>Sender</Text>
            <View style={styles.optionRow}>
              {chatSenders.map((sender) => (
                <Pressable
                  key={sender}
                  onPress={() => setChatSender(sender)}
                  style={[styles.optionPill, chatSender === sender ? styles.optionPillActive : null]}>
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
              placeholder="Delivery timing, quality checks, or quantity changes"
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
              selectedOrderMessages.slice(0, 4).map((message) => (
                <View key={message.id} style={styles.messageItem}>
                  <Text style={styles.messageSender}>{message.sender}</Text>
                  <Text style={styles.messageBody}>{message.body}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.caption}>No messages yet.</Text>
            )}
          </>
        ) : (
          <Text style={styles.helperText}>Open chat only when needed to reduce screen noise.</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  caption: {
    fontSize: 12,
    color: ui.textMuted,
  },
  helperText: {
    fontSize: 12,
    color: ui.textMuted,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ui.textMuted,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    backgroundColor: '#eef3ed',
    borderWidth: 1,
    borderColor: '#d8e2d5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionPillActive: {
    backgroundColor: ui.primary,
    borderColor: ui.primary,
  },
  optionPillText: {
    color: '#4a6151',
    fontSize: 11,
    fontWeight: '700',
  },
  optionPillTextActive: {
    color: '#ffffff',
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
  orderItem: {
    gap: 5,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: ui.surfaceMuted,
  },
  orderItemSelected: {
    borderColor: '#cbdacb',
    backgroundColor: '#edf5ee',
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderTitle: {
    color: ui.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  orderMeta: {
    color: ui.textMuted,
    fontSize: 12,
  },
  chatInput: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  messageItem: {
    backgroundColor: ui.surfaceMuted,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 11,
    padding: 10,
    gap: 3,
  },
  messageSender: {
    fontSize: 11,
    color: ui.primary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  messageBody: {
    fontSize: 12,
    color: '#38513f',
    lineHeight: 17,
  },
});
