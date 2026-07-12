import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { colors, cardStyle } from '../theme';

export default function Pods() {
  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>Pods — Team Up & Split Prizes</Text>
      <Text style={{ color: colors.muted, marginVertical: 8 }}>
        Create or join shared groups. Pool your odds and split prizes fairly — on-chain settlement is planned but not yet implemented.
      </Text>
      <Button title="Create New Pod" onPress={() => Alert.alert('Prototype — not implemented', 'Pod creation is not yet functional.')} color={colors.accent} />
      <Button title="Join Existing Pod" onPress={() => Alert.alert('Prototype — not implemented', 'Joining a pod is not yet functional.')} color={colors.accent} />
    </View>
  );
}