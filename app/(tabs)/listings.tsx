import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ActionButton, Field, ListingStatusPill, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';
import type { ListingStatus } from '@/types/agri';

const listingStatuses: ListingStatus[] = ['available', 'reserved', 'sold'];

export default function ListingsScreen() {
  const { listings, createListing, updateListingStatus } = useAgri();

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
  };

  return (
    <ScreenShell
      title="Crop Listings"
      subtitle="Create produce listings with quantity, pricing, harvest details, and selling status.">
      <SectionCard>
        <Text style={styles.sectionTitle}>Post new crop</Text>
        <Field label="Crop name" value={cropName} onChangeText={setCropName} placeholder="e.g. Tomatoes" />
        <Field
          label="Available quantity (kg)"
          value={quantityKg}
          onChangeText={setQuantityKg}
          keyboardType="numeric"
          placeholder="e.g. 850"
        />
        <Field
          label="Price per kg (USD)"
          value={pricePerKg}
          onChangeText={setPricePerKg}
          keyboardType="numeric"
          placeholder="e.g. 1.25"
        />
        <Field
          label="Harvest date (YYYY-MM-DD)"
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
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Active listings ({listings.length})</Text>

        {!listings.length ? (
          <Text style={styles.emptyText}>No listings available.</Text>
        ) : (
          listings.map((listing) => (
            <View key={listing.id} style={styles.listingItem}>
              <View style={styles.rowSpread}>
                <Text style={styles.listingTitle}>{listing.cropName}</Text>
                <ListingStatusPill status={listing.status} />
              </View>

              <Text style={styles.metaText}>
                {listing.quantityKg.toFixed(0)} kg | ${listing.pricePerKg.toFixed(2)}/kg
              </Text>
              <Text style={styles.metaText}>Harvest: {listing.harvestDate}</Text>

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
            </View>
          ))
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
  emptyText: {
    fontSize: 13,
    color: '#6a7f6d',
  },
  listingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e7eee3',
    paddingBottom: 10,
    gap: 4,
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b3724',
  },
  metaText: {
    fontSize: 13,
    color: '#5c725f',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  statusButton: {
    backgroundColor: '#edf3ec',
    borderWidth: 1,
    borderColor: '#d3ded1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusButtonActive: {
    backgroundColor: '#1b7a3c',
    borderColor: '#1b7a3c',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#436148',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
});
