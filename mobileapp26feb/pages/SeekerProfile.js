// mobileapp/pages/SeekerProfile.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createSeekerProfile } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SeekerProfile = ({ route, isDarkMode, toggleDarkMode }) => {
  const { contact } = route.params || {};
  const [fullName, setFullName] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const [saveScale] = useState(new Animated.Value(1));

  const handleSaveProfile = async () => {
    try {
      const isEmail = contact.includes('@');
      const payload = {
        fullName,
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        skills: skills.split(',').map(s => s.trim()),
        experience: parseInt(experience) || 0,
        location,
      };
      await createSeekerProfile(payload);
      setMessage('Profile saved successfully');
      setTimeout(() => navigation.navigate('SeekerDashboard', { user: payload, contact }), 2000);
    } catch (error) {
      setMessage('Error saving profile');
    }
  };

  const handlePressIn = (scale) => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Create Seeker Profile" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Create Seeker Profile</Text>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        />
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={skills}
          onChangeText={setSkills}
          placeholder="Skills (comma-separated)"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        />
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={experience}
          onChangeText={setExperience}
          placeholder="Experience (years)"
          keyboardType="numeric"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        />
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        />
        <TouchableOpacity
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={handleSaveProfile}
          onPressIn={() => handlePressIn(saveScale)}
          onPressOut={() => handlePressOut(saveScale)}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: saveScale }] }]}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </Animated.View>
        </TouchableOpacity>
        {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}
      </View>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  content: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
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
  message: { marginTop: 10, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
});

export default SeekerProfile;