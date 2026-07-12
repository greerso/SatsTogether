import React from 'react';
import { View, Text } from 'react-native';
import { colors } from './theme';
import YieldOptIn from './components/YieldOptIn';
import Pods from './components/Pods';
import Gamification from './components/Gamification';
import CovenantMigrationScreen from './components/CovenantMigrationScreen';
import AuditLog from './components/AuditLog';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.screen }}>
      <Text style={{ fontSize: 28, color: colors.accent, textAlign: 'center' }}>
        SatsTogether
      </Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>
        Decentralized Bitcoin Prize-Linked Savings • No Loss • Pure L1
      </Text>

      <YieldOptIn donations={[0.01, 0.05, 0.1]} onConfirm={(p) => console.log('Opt-in:', p)} />
      <Pods />
      <Gamification streak={42} badges={['Saver', 'Early Adopter']} />
      <CovenantMigrationScreen />
      <AuditLog />
    </View>
  );
}
