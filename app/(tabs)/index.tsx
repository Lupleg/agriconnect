import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ActionButton, ListingStatusPill, SectionCard } from '@/components/agri/ui';
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
      subtitle="Monitor inventory, deliveries, and daily sales activity from one place.">
      {!farmerProfile.onboardingComplete ? (
        <SectionCard>
          <Text style={styles.alertTitle}>Onboarding incomplete</Text>
          <Text style={styles.alertText}>
            Finish your profile and harvest plan in the Profile tab to start matching buyers faster.
          </Text>
        </SectionCard>
      ) : null}

      <View style={styles.metricGrid}>
        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Inventory (kg)</Text>
          <Text style={styles.metricValue}>{totalInventory.toFixed(0)}</Text>
        </SectionCard>

        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Projected value</Text>
          <Text style={styles.metricValue}>{fmtCurrency(projectedRevenue)}</Text>
        </SectionCard>

        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active orders</Text>
          <Text style={styles.metricValue}>{activeOrders}</Text>
        </SectionCard>

        <SectionCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Awaiting transport</Text>
          <Text style={styles.metricValue}>{pendingTransport}</Text>
        </SectionCard>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Order fulfillment</Text>
        <View style={styles.rowSpread}>
          <Text style={styles.rowLabel}>Delivered orders</Text>
          <Text style={styles.rowValue}>{deliveredOrders}</Text>
        </View>
        <View style={styles.rowSpread}>
          <Text style={styles.rowLabel}>Orders with transport</Text>
          <Text style={styles.rowValue}>{transportRequests.length}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Current listings</Text>
        {listings.length ? (
          listings.slice(0, 4).map((listing) => (
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
          <Text style={styles.emptyText}>No crop listings yet. Add your first listing from the Listings tab.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Harvest plan</Text>
        {farmerProfile.harvestPlans.length ? (
          farmerProfile.harvestPlans.map((plan) => (
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
          label="Manage harvest plan in Profile"
          onPress={() => router.push('/profile')}
          variant="secondary"
        />
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
  },
  metricLabel: {
    fontSize: 12,
    color: '#5c725f',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    color: '#193423',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#183121',
  },
  rowSpread: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    color: '#365240',
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: '#193423',
    fontSize: 13,
    fontWeight: '700',
  },
  listItem: {
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2eb',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#163323',
  },
  listMeta: {
    fontSize: 13,
    color: '#5a735e',
  },
  emptyText: {
    fontSize: 13,
    color: '#627a68',
  },
  alertTitle: {
    color: '#934500',
    fontWeight: '700',
    fontSize: 15,
  },
  alertText: {
    color: '#754c17',
    fontSize: 13,
    lineHeight: 18,
  },
});
