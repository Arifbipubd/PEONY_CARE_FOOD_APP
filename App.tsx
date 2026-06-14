// App.tsx — the root of the entire application.
// It only renders RootNavigator, which handles all routing logic.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}
