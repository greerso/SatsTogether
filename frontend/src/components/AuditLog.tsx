import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { colors, cardStyle } from '../theme';

export default function AuditLog() {
  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>On-Chain Audit Log</Text>
      <Text style={{ color: colors.muted }}>Every yield, draw, and migration is planned to be publicly verifiable on Bitcoin L1 (not yet implemented).</Text>
      <Button title="View Latest Proofs" onPress={() => Alert.alert('Prototype — not implemented', 'On-chain proof viewing is not yet implemented.')} color={colors.accent} />
    </View>
  );
}