// mobileapp/pages/Home.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = ({ isDarkMode, toggleDarkMode }) => {
  const navigation = useNavigation();
  const [seekerScale] = useState(new Animated.Value(1));
  const [providerScale] = useState(new Animated.Value(1));

  const handleRoleSelect = (role) => {
    navigation.navigate('AuthForm', { role });
  };

  const handlePressIn = (scale) => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="JobConnector Mobile" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>JobConnector Mobile</Text>
        <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>Find or Provide Jobs Easily</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => handleRoleSelect('seeker')}
            onPressIn={() => handlePressIn(seekerScale)}
            onPressOut={() => handlePressOut(seekerScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: seekerScale }] }]}>
              <Text style={styles.buttonText}>Job Seeker</Text>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => handleRoleSelect('provider')}
            onPressIn={() => handlePressIn(providerScale)}
            onPressOut={() => handlePressOut(providerScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: providerScale }] }]}>
              <Text style={styles.buttonText}>Job Provider</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 40, textAlign: 'center' },
  buttonContainer: { flexDirection: 'column', width: '80%', gap: 20 },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
});

export default Home;