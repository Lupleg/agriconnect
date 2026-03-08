import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native';

import type { ListingStatus, OrderStatus } from '@/types/agri';

export function SectionCard({ children, style }: ViewProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type FieldProps = TextInputProps & {
  label: string;
};

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor="#92a494"
        autoCorrect={false}
      />
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function ActionButton({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        pressed ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}>
      <Text style={variant === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ListingStatusPill({ status }: { status: ListingStatus }) {
  const palette =
    status === 'available'
      ? { bg: '#ddf3dc', fg: '#1c5f1f' }
      : status === 'reserved'
        ? { bg: '#fff2d8', fg: '#8a5b08' }
        : { bg: '#e7eaed', fg: '#4b5563' };

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const palette =
    status === 'pending'
      ? { bg: '#e7f0ff', fg: '#2253a4' }
      : status === 'picked'
        ? { bg: '#ede7ff', fg: '#5a3ca6' }
        : status === 'in transit'
          ? { bg: '#fff3dd', fg: '#905b06' }
          : { bg: '#ddf3dc', fg: '#1c5f1f' };

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#dfe7d8',
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f4636',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c8d5c8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#152618',
    backgroundColor: '#f9fcf5',
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1c7c3d',
  },
  buttonSecondary: {
    backgroundColor: '#e9f3e9',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonSecondaryText: {
    color: '#1f5731',
    fontWeight: '700',
    fontSize: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
