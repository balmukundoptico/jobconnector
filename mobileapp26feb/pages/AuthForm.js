// mobileapp/pages/AuthForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requestOTP, verifyOTP } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AuthForm = ({ route, isDarkMode, toggleDarkMode }) => {
  const { role } = route.params || {};
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const navigation = useNavigation();
  const [otpScale] = useState(new Animated.Value(1));
  const [bypassScale] = useState(new Animated.Value(1));

  const handleRequestOTP = async () => {
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
      return;
    }
    try {
      const isEmail = contact.includes('@');
      const payload = isEmail ? { email: contact, role, loginRequest: true } : { whatsappNumber: contact, role, loginRequest: true };
      const response = await requestOTP(payload);
      setServerOtp(response.data.serverOtp);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending OTP');
      if (error.response?.status === 404) {
        setMessage('User not found, redirecting to register...');
        setTimeout(() => navigation.navigate('Register', { role }), 2000);
      }
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
        if (response.data.isNewUser) {
          navigation.navigate(`${role === 'seeker' ? 'SeekerProfile' : 'ProviderProfile'}`, { contact });
        } else {
          navigation.navigate(`${role === 'seeker' ? 'SeekerDashboard' : 'ProviderDashboard'}`, { user: response.data.user, contact });
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleBypassOTP = async () => {
    if (!contact) {
      setMessage('Please enter a WhatsApp number or email');
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
      setMessage(response.data.message);

      if (response.data.success) {
        if (response.data.isNewUser) {
          navigation.navigate(`${role === 'seeker' ? 'SeekerProfile' : 'ProviderProfile'}`, { contact });
        } else {
          navigation.navigate(`${role === 'seeker' ? 'SeekerDashboard' : 'ProviderDashboard'}`, { user: response.data.user, contact });
        }
      } else {
        setMessage('Bypass failed. Please use OTP.');
      }
    } catch (error) {
      setMessage('Error bypassing OTP. Redirecting to register...');
      setTimeout(() => navigation.navigate('Register', { role }), 2000);
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
      <Header title={`${role === 'seeker' ? 'Job Seeker' : 'Job Provider'} Login`} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          {role === 'seeker' ? 'Job Seeker' : 'Job Provider'} Login
        </Text>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={contact}
          onChangeText={setContact}
          placeholder="WhatsApp or Email"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
          editable={!otpSent}
        />
        {otpSent && (
          <TextInput
            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
          />
        )}
        <TouchableOpacity
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={otpSent ? handleVerifyOTP : handleRequestOTP}
          onPressIn={() => handlePressIn(otpScale)}
          onPressOut={() => handlePressOut(otpScale)}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: otpScale }] }]}>
            <Text style={styles.buttonText}>{otpSent ? 'Verify OTP' : 'Get OTP'}</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={handleBypassOTP}
          onPressIn={() => handlePressIn(bypassScale)}
          onPressOut={() => handlePressOut(bypassScale)}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: bypassScale }] }]}>
            <Text style={styles.buttonText}>Bypass OTP</Text>
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

export default AuthForm;