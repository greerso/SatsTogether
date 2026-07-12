import React from 'react';
import { View, Text } from 'react-native';
import { colors, cardStyle } from '../theme';

export default function Gamification({ streak, badges }: { streak: number; badges: string[] }) {
  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>🔥 {streak}-day Savings Streak!</Text>
      <Text style={{ color: colors.muted }}>Badges: {badges.join(', ')}</Text>
      <Text style={{ fontSize: 12, color: colors.dim, marginTop: 8 }}>
        Keep saving to unlock exclusive badges.
      </Text>
    </View>
  );
}