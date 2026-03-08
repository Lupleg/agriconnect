import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ui } from '@/components/agri/theme';
import { ActionButton, ListingStatusPill, SectionCard } from '@/components/agri/ui';
import { ScreenShell } from '@/components/agri/screen-shell';
import { useAgri } from '@/context/agri-context';

function fmtCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { farmerProfile, listings, orders, transportRequests } = useAgri();

  const totalInventory = listings.reduce((sum, listing) => sum + listing.quantityKg, 0);
  const activeOrders = orders.filter((order) => order.status !== 'delivered').length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const pendingTransport = orders.filter(
    (order) =>
      order.status !== 'delivered' &&
      !transportRequests.some((request) => request.orderId === order.id),
  ).length;

  const projectedRevenue = listings.reduce(
    (sum, listing) => sum + listing.quantityKg * listing.pricePerKg,
    0,
  );

  return (
    <ScreenShell
      title="Farmer Dashboard"
      subtitle="A quick operational view of inventory, orders, transport, and harvest readiness.">
      {!farmerProfile.onboardingComplete ? (
        <SectionCard style={styles.alertCard}>
          <Text style={styles.alertTitle}>Onboarding incomplete</Text>
          <Text style={styles.alertText}>
            Complete your profile and harvest plan in the Profile tab to improve buyer matching.
          </Text>
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text style={styles.sectionTitle}>Key metrics</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Inventory (kg)</Text>
            <Text style={styles.metricValue}>{totalInventory.toFixed(0)}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Projected value</Text>
            <Text style={styles.metricValue}>{fmtCurrency(projectedRevenue)}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Active orders</Text>
            <Text style={styles.metricValue}>{activeOrders}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>Awaiting transport</Text>
            <Text style={styles.metricValue}>{pendingTransport}</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Current operations</Text>
        <View style={styles.rowSpread}>
          <Text style={styles.rowLabel}>Delivered orders</Text>
          <Text style={styles.rowValue}>{deliveredOrders}</Text>
        </View>
        <View style={styles.rowSpread}>
          <Text style={styles.rowLabel}>Orders with transport assigned</Text>
          <Text style={styles.rowValue}>{transportRequests.length}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Listings snapshot</Text>
        {listings.length ? (
          listings.slice(0, 3).map((listing) => (
            <View key={listing.id} style={styles.listItem}>
              <View style={styles.rowSpread}>
                <Text style={styles.listTitle}>{listing.cropName}</Text>
                <ListingStatusPill status={listing.status} />
              </View>
              <Text style={styles.listMeta}>
                {listing.quantityKg.toFixed(0)} kg at {fmtCurrency(listing.pricePerKg)}/kg
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No crop listings yet.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Harvest timeline</Text>
        {farmerProfile.harvestPlans.length ? (
          farmerProfile.harvestPlans.slice(0, 4).map((plan) => (
            <View key={plan.id} style={styles.rowSpread}>
              <Text style={styles.rowLabel}>
                {plan.cropName} ({plan.quantityKg} kg)
              </Text>
              <Text style={styles.rowValue}>{plan.harvestDate}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No harvest plans added yet.</Text>
        )}

        <ActionButton
          label="Manage harvest plan"
          onPress={() => router.push('/profile')}
          variant="secondary"
        />
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
  alertCard: {
    backgroundColor: '#fff7ee',
    borderColor: '#f1dfc9',
    shadowOpacity: 0,
    elevation: 0,
  },
  alertTitle: {
    color: '#8b5e23',
    fontWeight: '700',
    fontSize: 14,
  },
  alertText: {
    color: '#806448',
    fontSize: 12,
    lineHeight: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    width: '48%',
    backgroundColor: ui.surfaceMuted,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: ui.textMuted,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    color: ui.heading,
    fontWeight: '700',
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    color: ui.textMuted,
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: ui.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  listItem: {
    gap: 4,
    backgroundColor: ui.surfaceMuted,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ui.heading,
  },
  listMeta: {
    fontSize: 12,
    color: ui.textMuted,
  },
  emptyText: {
    fontSize: 12,
    color: ui.textMuted,
  },
});
