// O:\JobConnector\mobileapp\pages\Register.js
import React, { useState } from 'react'; // React core
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native'; // RN components
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import { requestOTP, verifyOTP } from '../utils/api'; // API functions
import Header from '../components/Header'; // Reusable header
import Footer from '../components/Footer'; // Reusable footer

// Register component with live OTP
const Register = ({ isDarkMode, toggleDarkMode }) => {
  const [contact, setContact] = useState(''); // WhatsApp or email input
  const [otp, setOtp] = useState(''); // OTP input
  const [message, setMessage] = useState(''); // Message display
  const [role, setRole] = useState(null); // Role selection
  const [otpSent, setOtpSent] = useState(false); // Tracks OTP request
  const navigation = useNavigation(); // Navigation instance
  const [seekerScale] = useState(new Animated.Value(1)); // Animation scales
  const [providerScale] = useState(new Animated.Value(1));
  const [registerScale] = useState(new Animated.Value(1));
  const [verifyScale] = useState(new Animated.Value(1));

  // Handle requesting OTP
  const handleRequestOTP = async () => {
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    if (!role) {
      setMessage('Please select a role');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = isEmail ? { email: contact, role, loginRequest: false } : { whatsappNumber: contact, role, loginRequest: false };
      const response = await requestOTP(payload); // Live backend call
      setMessage(response.data.message); // Show message
      setOtpSent(true); // Mark OTP sent
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending OTP');
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage('Please enter the OTP');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = {
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        otp,
        role,
        bypass: false,
      };
      const response = await verifyOTP(payload); // Live backend call
      setMessage(response.data.message); // Show message
      if (response.data.success) {
        navigation.navigate(`${role}-profile`, { contact, isEmail }); // Navigate to profile creation
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  // Animation handlers
  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  // Render UI
  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Register" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          Register as Job Seeker or Job Provider
        </Text>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={contact}
          onChangeText={setContact}
          placeholder="WhatsApp number or email"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
          editable={!otpSent}
        />
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'seeker' && styles.selectedRole, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => setRole('seeker')}
            onPressIn={() => handlePressIn(seekerScale)}
            onPressOut={() => handlePressOut(seekerScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: seekerScale }] }]}>
              <Text style={styles.buttonText}>Job Seeker</Text>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'provider' && styles.selectedRole, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => setRole('provider')}
            onPressIn={() => handlePressIn(providerScale)}
            onPressOut={() => handlePressOut(providerScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: providerScale }] }]}>
              <Text style={styles.buttonText}>Job Provider</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
        {otpSent ? (
          <>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleVerifyOTP}
              onPressIn={() => handlePressIn(verifyScale)}
              onPressOut={() => handlePressOut(verifyScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: verifyScale }] }]}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </Animated.View>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={handleRequestOTP}
            onPressIn={() => handlePressIn(registerScale)}
            onPressOut={() => handlePressOut(registerScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: registerScale }] }]}>
              <Text style={styles.buttonText}>Register</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
        {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}
      </View>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  content: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  roleButton: { padding: 10, borderRadius: 5 },
  selectedRole: { backgroundColor: '#003F87' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' }
});

export default Register;