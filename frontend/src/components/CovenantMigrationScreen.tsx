import React from 'react';
import { View, Text } from 'react-native';
import { colors, cardStyle } from '../theme';

// Covenant opcodes (OP_CTV / OP_CAT) are not live on mainnet, and both
// detection and migration are unimplemented (see bitvm/covenant-utils). Until
// there's something real to drive, this screen is a static notice — the
// migration state machine returns when covenant detection actually exists.
export default function CovenantMigrationScreen() {
  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>Covenant Upgrade</Text>
      <Text style={{ color: colors.muted }}>
        Covenants not yet active on mainnet. Principal-vault migration is a design goal, not yet implemented.
      </Text>
    </View>
  );
}
