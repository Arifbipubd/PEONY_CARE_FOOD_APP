// TODO: implement QrScannerScreen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QrScannerScreen() {
  return (
    <View style={styles.container}>
      <Text>QrScannerScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
