import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ui } from '@/components/agri/theme';

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top * 0.25, 6),
            paddingBottom: 110 + insets.bottom,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ui.bg,
  },
  content: {
    paddingHorizontal: 16,
    gap: 11,
  },
  hero: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  header: {
    paddingTop: 8,
    gap: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: ui.heading,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: ui.textMuted,
    lineHeight: 19,
    maxWidth: 620,
  },
});
