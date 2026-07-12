import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, cardStyle } from '../theme';

export default function YieldOptIn({ donations, onConfirm }: { donations: number[]; onConfirm: (percent: number) => void }) {
  const [percent, setPercent] = useState(5);

  // Dynamic quadratic example
  const userDonation = percent / 100;
  const sumSqrt = donations.reduce((sum, c) => sum + Math.sqrt(c), 0);
  const totalMatched = Math.pow(sumSqrt, 2);
  const userMatch = sumSqrt > 0 ? (Math.sqrt(userDonation) / sumSqrt) * totalMatched : 0;

  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>Optional Community Contribution (Quadratic)</Text>
      <Text style={{ color: colors.muted, marginVertical: 8 }}>
        Your {percent}% yield contribution is matched as ~{userMatch.toFixed(5)} BTC (small donations amplified).
      </Text>
      <Slider minimumValue={0} maximumValue={10} value={percent} onValueChange={setPercent} step={1} />
      <Button title={`Confirm ${percent}% (optional)`} onPress={() => onConfirm(percent)} color={colors.accent} />
      <Button title="Disable (0%)" onPress={() => onConfirm(0)} color={colors.dim} />
    </View>
  );
}
