import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ui } from '@/components/agri/theme';
import { ActionButton, Field, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';

export default function ProfileScreen() {
  const { farmerProfile, upsertFarmerProfile, addHarvestPlan, removeHarvestPlan } = useAgri();

  const [showOnboardingForm, setShowOnboardingForm] = useState(!farmerProfile.onboardingComplete);
  const [showHarvestForm, setShowHarvestForm] = useState(false);

  const [fullName, setFullName] = useState(farmerProfile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(farmerProfile.phoneNumber);
  const [farmLocation, setFarmLocation] = useState(farmerProfile.farmLocation);
  const [cropTypesRaw, setCropTypesRaw] = useState(farmerProfile.cropTypes.join(', '));

  const [harvestCropName, setHarvestCropName] = useState('');
  const [harvestDate, setHarvestDate] = useState('2026-03-20');
  const [harvestQuantity, setHarvestQuantity] = useState('');

  return (
    <ScreenShell
      title="Farmer Profile"
      subtitle="Profile and harvest planning are collapsed by default to keep the page clean.">
      <SectionCard>
        <View style={styles.headerRow}>
          <View style={styles.statusRow}>
            <Text style={styles.sectionTitle}>Onboarding</Text>
            <View
              style={[
                styles.statusBadge,
                farmerProfile.onboardingComplete ? styles.statusComplete : styles.statusPending,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  farmerProfile.onboardingComplete
                    ? styles.statusTextComplete
                    : styles.statusTextPending,
                ]}>
                {farmerProfile.onboardingComplete ? 'Complete' : 'Incomplete'}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.ghostButton}
            onPress={() => setShowOnboardingForm((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showOnboardingForm ? 'Close' : 'Edit'}</Text>
          </Pressable>
        </View>

        {showOnboardingForm ? (
          <>
            <Field
              label="Farmer name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Farmer name"
            />
            <Field
              label="Phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+254 ..."
            />
            <Field
              label="Farm location"
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Village / district"
            />
            <Field
              label="Crop types (comma-separated)"
              value={cropTypesRaw}
              onChangeText={setCropTypesRaw}
              placeholder="Maize, Beans, Tomatoes"
            />

            <ActionButton
              label="Save profile"
              onPress={() => {
                const cropTypes = cropTypesRaw
                  .split(',')
                  .map((crop) => crop.trim())
                  .filter(Boolean);

                upsertFarmerProfile({
                  fullName: fullName.trim(),
                  phoneNumber: phoneNumber.trim(),
                  farmLocation: farmLocation.trim(),
                  cropTypes,
                  harvestPlans: farmerProfile.harvestPlans,
                });

                setShowOnboardingForm(false);
              }}
            />
          </>
        ) : (
          <Text style={styles.helperText}>Open Edit when profile changes are needed.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Harvest plans</Text>
          <Pressable style={styles.ghostButton} onPress={() => setShowHarvestForm((current) => !current)}>
            <Text style={styles.ghostButtonText}>{showHarvestForm ? 'Close' : 'Add'}</Text>
          </Pressable>
        </View>

        {showHarvestForm ? (
          <>
            <View style={styles.splitRow}>
              <View style={styles.splitCol}>
                <Field
                  label="Crop"
                  value={harvestCropName}
                  onChangeText={setHarvestCropName}
                  placeholder="Onions"
                />
              </View>
              <View style={styles.splitCol}>
                <Field
                  label="Quantity (kg)"
                  value={harvestQuantity}
                  onChangeText={setHarvestQuantity}
                  keyboardType="numeric"
                  placeholder="500"
                />
              </View>
            </View>
            <Field
              label="Harvest date"
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholder="2026-03-28"
            />

            <ActionButton
              label="Add harvest plan"
              onPress={() => {
                const quantity = Number(harvestQuantity);

                if (
                  !harvestCropName.trim() ||
                  !harvestDate.trim() ||
                  Number.isNaN(quantity) ||
                  quantity <= 0
                ) {
                  return;
                }

                addHarvestPlan({
                  cropName: harvestCropName.trim(),
                  harvestDate: harvestDate.trim(),
                  quantityKg: quantity,
                });

                setHarvestCropName('');
                setHarvestQuantity('');
                setShowHarvestForm(false);
              }}
            />
          </>
        ) : (
          <Text style={styles.helperText}>Use Add to enter a new harvest plan.</Text>
        )}

        {farmerProfile.harvestPlans.length ? (
          farmerProfile.harvestPlans.map((plan) => (
            <View key={plan.id} style={styles.planRow}>
              <View style={styles.planDetails}>
                <Text style={styles.planTitle}>{plan.cropName}</Text>
                <Text style={styles.planMeta}>
                  {plan.harvestDate} · {plan.quantityKg} kg
                </Text>
              </View>
              <Pressable onPress={() => removeHarvestPlan(plan.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.caption}>No harvest plans added yet.</Text>
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
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusComplete: {
    backgroundColor: '#eaf4ed',
    borderColor: '#cae1d0',
  },
  statusPending: {
    backgroundColor: '#fff4e6',
    borderColor: '#f1dfc1',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextComplete: {
    color: '#2f6a47',
  },
  statusTextPending: {
    color: '#8e6832',
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
  caption: {
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
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 11,
    padding: 10,
    backgroundColor: ui.surfaceMuted,
  },
  planDetails: {
    gap: 3,
    flex: 1,
  },
  planTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ui.heading,
  },
  planMeta: {
    fontSize: 12,
    color: ui.textMuted,
  },
  removeButton: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: ui.dangerSoft,
  },
  removeButtonText: {
    color: ui.danger,
    fontWeight: '700',
    fontSize: 11,
  },
});
