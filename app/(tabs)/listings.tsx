import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ui } from '@/components/agri/theme';
import { ActionButton, Field, ListingStatusPill, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';
import type { ListingStatus } from '@/types/agri';

const listingStatuses: ListingStatus[] = ['available', 'reserved', 'sold'];

export default function ListingsScreen() {
  const { listings, createListing, updateListingStatus } = useAgri();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);

  const [cropName, setCropName] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [harvestDate, setHarvestDate] = useState('2026-03-18');
  const [photoUrl, setPhotoUrl] = useState('');

  const addListing = () => {
    const parsedQuantity = Number(quantityKg);
    const parsedPrice = Number(pricePerKg);

    if (
      !cropName.trim() ||
      Number.isNaN(parsedQuantity) ||
      Number.isNaN(parsedPrice) ||
      parsedQuantity <= 0 ||
      parsedPrice <= 0 ||
      !harvestDate.trim()
    ) {
      return;
    }

    createListing({
      cropName: cropName.trim(),
      quantityKg: parsedQuantity,
      pricePerKg: parsedPrice,
      harvestDate: harvestDate.trim(),
      photoUrl: photoUrl.trim(),
      status: 'available',
    });

    setCropName('');
    setQuantityKg('');
    setPricePerKg('');
    setHarvestDate('2026-03-18');
    setPhotoUrl('');
    setShowCreateForm(false);
  };

  return (
    <ScreenShell
      title="Crop Listings"
      subtitle="Keep inventory clean and only open editing controls when needed.">
      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Create listing</Text>
          <Pressable style={styles.ghostButton} onPress={() => setShowCreateForm((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showCreateForm ? 'Close' : 'New listing'}</Text>
          </Pressable>
        </View>

        {showCreateForm ? (
          <>
            <Field label="Crop name" value={cropName} onChangeText={setCropName} placeholder="Tomatoes" />
            <View style={styles.splitRow}>
              <View style={styles.splitCol}>
                <Field
                  label="Quantity (kg)"
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                  keyboardType="numeric"
                  placeholder="850"
                />
              </View>
              <View style={styles.splitCol}>
                <Field
                  label="Price/kg (USD)"
                  value={pricePerKg}
                  onChangeText={setPricePerKg}
                  keyboardType="numeric"
                  placeholder="1.25"
                />
              </View>
            </View>
            <Field
              label="Harvest date"
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholder="2026-03-25"
            />
            <Field
              label="Photo URL (optional)"
              value={photoUrl}
              onChangeText={setPhotoUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />
            <ActionButton label="Create listing" onPress={addListing} />
          </>
        ) : (
          <Text style={styles.helperText}>Use New listing to add fresh produce stock.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Active listings ({listings.length})</Text>

        {!listings.length ? (
          <Text style={styles.emptyText}>No listings available.</Text>
        ) : (
          listings.map((listing) => {
            const expanded = expandedListingId === listing.id;

            return (
              <Pressable
                key={listing.id}
                style={styles.listingItem}
                onPress={() => setExpandedListingId((current) => (current === listing.id ? null : listing.id))}>
                <View style={styles.rowSpread}>
                  <Text style={styles.listingTitle}>{listing.cropName}</Text>
                  <ListingStatusPill status={listing.status} />
                </View>

                <Text style={styles.metaText}>
                  {listing.quantityKg.toFixed(0)} kg | ${listing.pricePerKg.toFixed(2)}/kg | {listing.harvestDate}
                </Text>

                {expanded ? (
                  <View style={styles.statusRow}>
                    {listingStatuses.map((status) => (
                      <Pressable
                        key={status}
                        onPress={() => updateListingStatus(listing.id, status)}
                        style={[
                          styles.statusButton,
                          listing.status === status ? styles.statusButtonActive : null,
                        ]}>
                        <Text
                          style={[
                            styles.statusButtonText,
                            listing.status === status ? styles.statusButtonTextActive : null,
                          ]}>
                          {status}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.helperText}>Tap to manage status</Text>
                )}
              </Pressable>
            );
          })
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
  helperText: {
    fontSize: 12,
    color: ui.textMuted,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitCol: {
    flex: 1,
  },
  emptyText: {
    fontSize: 12,
    color: ui.textMuted,
  },
  listingItem: {
    backgroundColor: ui.surfaceMuted,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ui.heading,
  },
  metaText: {
    fontSize: 12,
    color: ui.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
  },
  statusButton: {
    backgroundColor: '#f0f5ef',
    borderWidth: 1,
    borderColor: '#d8e3d6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusButtonActive: {
    backgroundColor: ui.primary,
    borderColor: ui.primary,
  },
  statusButtonText: {
    fontSize: 11,
    color: '#4b6352',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
});
