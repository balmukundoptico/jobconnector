// mobileapp/pages/Register.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requestOTP, verifyOTP } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = ({ isDarkMode, toggleDarkMode }) => {
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const navigation = useNavigation();
  const [seekerScale] = useState(new Animated.Value(1));
  const [providerScale] = useState(new Animated.Value(1));
  const [registerScale] = useState(new Animated.Value(1));
  const [verifyScale] = useState(new Animated.Value(1));

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
      const response = await requestOTP(payload);
      setServerOtp(response.data.serverOtp);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending OTP');
    }
  };

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
        serverOtp,
        role,
        bypass: false,
      };
      const response = await verifyOTP(payload);
      setMessage(response.data.message);

      if (response.data.message === 'OTP verification successful') {
        navigation.navigate(role === 'seeker' ? 'SeekerProfile' : 'ProviderProfile', { contact });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleCheckUser = async () => {
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
      const payload = {
        ...(isEmail ? { email: contact } : { whatsappNumber: contact }),
        otp: 'bypass',
        role,
        bypass: true,
      };
      const response = await verifyOTP(payload);
      if (response.data.isNewUser) {
        await handleRequestOTP();
      } else {
        setMessage('Profile exists. Redirecting to login...');
        setTimeout(() => navigation.navigate('AuthForm', { role }), 2000);
      }
    } catch (error) {
      setMessage('Error checking user. Proceeding to OTP...');
      await handleRequestOTP();
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
      <Header title="Register" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Register as Job Seeker or Job Provider</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[styles.roleButton, isDarkMode ? styles.darkButton : styles.lightButton]}
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
            style={[styles.roleButton, isDarkMode ? styles.darkButton : styles.lightButton]}
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
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={contact}
          onChangeText={setContact}
          placeholder="WhatsApp number or email"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
          editable={!otpSent}
        />
        {otpSent ? (
          <>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
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
            onPress={handleCheckUser}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  content: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  roleButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  roleButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
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
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  message: { marginTop: 10, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
});

export default Register;