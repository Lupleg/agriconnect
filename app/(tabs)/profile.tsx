import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/agri/screen-shell';
import { ActionButton, Field, SectionCard } from '@/components/agri/ui';
import { useAgri } from '@/context/agri-context';

export default function ProfileScreen() {
  const { farmerProfile, upsertFarmerProfile, addHarvestPlan, removeHarvestPlan } = useAgri();

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
      subtitle="Complete onboarding with farm details and maintain harvest dates with quantities.">
      <SectionCard>
        <Text style={styles.sectionTitle}>Onboarding</Text>
        <Text style={styles.caption}>
          Status: {farmerProfile.onboardingComplete ? 'Complete' : 'Incomplete'}
        </Text>

        <Field
          label="Farmer full name"
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
          label="Save onboarding profile"
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
          }}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Harvest plans</Text>
        <Field
          label="Crop"
          value={harvestCropName}
          onChangeText={setHarvestCropName}
          placeholder="e.g. Onions"
        />
        <Field
          label="Harvest date (YYYY-MM-DD)"
          value={harvestDate}
          onChangeText={setHarvestDate}
          placeholder="2026-03-28"
        />
        <Field
          label="Estimated quantity (kg)"
          value={harvestQuantity}
          onChangeText={setHarvestQuantity}
          keyboardType="numeric"
          placeholder="500"
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
          }}
        />

        {farmerProfile.harvestPlans.length ? (
          farmerProfile.harvestPlans.map((plan) => (
            <View key={plan.id} style={styles.planRow}>
              <View style={styles.planDetails}>
                <Text style={styles.planTitle}>{plan.cropName}</Text>
                <Text style={styles.planMeta}>
                  {plan.harvestDate} | {plan.quantityKg} kg
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
    fontSize: 16,
    fontWeight: '700',
    color: '#183121',
  },
  caption: {
    fontSize: 13,
    color: '#607565',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dce7d8',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f7fbf6',
  },
  planDetails: {
    gap: 4,
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c3624',
  },
  planMeta: {
    fontSize: 12,
    color: '#5d735f',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffe8e4',
  },
  removeButtonText: {
    color: '#9a3c2d',
    fontWeight: '700',
    fontSize: 12,
  },
});
