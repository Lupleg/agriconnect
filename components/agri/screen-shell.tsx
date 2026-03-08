import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f8f0',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    paddingTop: 16,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a23',
  },
  subtitle: {
    fontSize: 15,
    color: '#48614f',
    lineHeight: 20,
  },
});
