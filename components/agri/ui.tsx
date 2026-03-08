import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  ViewProps,
} from 'react-native';

import { ui } from '@/components/agri/theme';
import type { ListingStatus, OrderStatus } from '@/types/agri';

export function SectionCard({ children, style }: ViewProps) {
  return <View style={[styles.card, style as StyleProp<ViewStyle>]}>{children}</View>;
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
        placeholderTextColor="#9aac9f"
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
      ? { bg: '#ebf5ee', fg: '#2f6a47' }
      : status === 'reserved'
        ? { bg: '#fff4e1', fg: '#90642a' }
        : { bg: '#edf1ee', fg: '#56665d' };

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const palette =
    status === 'pending'
      ? { bg: '#ecf3ff', fg: '#3d5f96' }
      : status === 'picked'
        ? { bg: '#efebff', fg: '#6a549f' }
        : status === 'in transit'
          ? { bg: '#fff5e7', fg: '#8e6630' }
          : { bg: '#eaf4ed', fg: '#2f6a47' };

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: ui.border,
    shadowColor: ui.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ui.textMuted,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: ui.text,
    backgroundColor: ui.surfaceMuted,
  },
  button: {
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: ui.primary,
  },
  buttonSecondary: {
    backgroundColor: ui.primarySoft,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPrimaryText: {
    color: '#f8fbf8',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonSecondaryText: {
    color: ui.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
