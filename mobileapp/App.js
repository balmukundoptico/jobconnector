import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Home from './pages/Home';

export default function App() {
  console.log('App rendering');
  return (
    <View style={styles.container}>
      <Home />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});