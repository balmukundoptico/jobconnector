// O:\JobConnector\mobileapp\pages\Register.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requestOTP, verifyOTP, getProfile } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = ({ isDarkMode, toggleDarkMode }) => {
  const navigation = useNavigation();
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');

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
      console.log('Request OTP Payload:', payload);
      const response = await requestOTP(payload);
      setServerOtp(response.data.serverOtp);
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      console.error('OTP Request Error:', error.response?.data || error.message);
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
      console.log('Verify OTP Payload:', payload);
      const response = await verifyOTP(payload);
      setMessage(response.data.message);

      if (response.data.message === 'OTP verification successful') {
        navigation.navigate(`${role === 'seeker' ? 'SeekerProfile' : 'ProviderProfile'}`, { contact, isEmail });
      }
    } catch (error) {
      console.error('OTP Verify Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleBypassOTP = async () => {
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
      console.log('Bypass OTP Payload:', payload);
      const response = await verifyOTP(payload);
      console.log('Bypass OTP Response:', response.data);

      if (response.data.isNewUser) {
        // New user: redirect to profile creation
        setMessage('New user detected. Redirecting to profile creation...');
        navigation.navigate(`${role === 'seeker' ? 'SeekerProfile' : 'ProviderProfile'}`, { contact, isEmail });
      } else {
        // Old user: fetch profile and redirect to dashboard
        const profileResponse = await getProfile({ role, [isEmail ? 'email' : 'whatsappNumber']: contact });
        console.log('Profile Response:', profileResponse.data);
        setMessage('Profile exists. Redirecting to dashboard...');
        setTimeout(() => navigation.navigate(`${role === 'seeker' ? 'SeekerDashboard' : 'ProviderDashboard'}`, { user: profileResponse.data }), 2000);
      }
    } catch (error) {
      console.error('Bypass OTP Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error bypassing OTP');
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Register" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.main}>
        <View style={[styles.card, isDarkMode ? styles.darkCard : styles.lightCard]}>
          <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
            Register as Job Seeker or Job Provider
          </Text>
          <TextInput
            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
            value={contact}
            onChangeText={setContact}
            placeholder="WhatsApp number or email"
            placeholderTextColor={isDarkMode ? '#D1D5DB' : '#9CA3AF'}
            editable={!otpSent}
          />
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'seeker' ? styles.seekerButton : (isDarkMode ? styles.darkRoleButton : styles.lightRoleButton)
              ]}
              onPress={() => setRole('seeker')}
            >
              <Text style={styles.roleButtonText}>Job Seeker</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'provider' ? styles.providerButton : (isDarkMode ? styles.darkRoleButton : styles.lightRoleButton)
              ]}
              onPress={() => setRole('provider')}
            >
              <Text style={styles.roleButtonText}>Job Provider</Text>
            </TouchableOpacity>
          </View>
          {!otpSent ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isDarkMode ? styles.darkSubmitButton : styles.lightSubmitButton]}
                onPress={handleRequestOTP}
              >
                <Text style={styles.submitButtonText}>Get OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, styles.bypassButton]}
                onPress={handleBypassOTP}
              >
                <Text style={styles.submitButtonText}>Bypass OTP</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <TextInput
                style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                placeholderTextColor={isDarkMode ? '#D1D5DB' : '#9CA3AF'}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.submitButton, styles.verifyButton]}
                onPress={handleVerifyOTP}
              >
                <Text style={styles.submitButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            </View>
          )}
          {message ? (
            <Text style={[styles.message, isDarkMode ? styles.darkMessage : styles.lightMessage]}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

// Styles adapted from Tailwind CSS
const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#FFFFFF' },
  darkContainer: { backgroundColor: '#1F2937' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    gap: 24,
  },
  lightCard: { backgroundColor: '#FFFFFF' },
  darkCard: { backgroundColor: '#1F2937' },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  input: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  lightInput: { borderColor: '#D1D5DB', color: '#000000', backgroundColor: '#F9FAFB' },
  darkInput: { borderColor: '#4B5563', color: '#F9FAFB', backgroundColor: '#374151' },
  roleContainer: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  roleButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  lightRoleButton: { backgroundColor: '#E5E7EB' },
  darkRoleButton: { backgroundColor: '#4B5563' },
  seekerButton: { backgroundColor: '#3B82F6' },
  providerButton: { backgroundColor: '#10B981' },
  roleButtonText: { color: '#FFFFFF', fontSize: 16 },
  buttonContainer: { width: '100%', gap: 16 },
  otpContainer: { width: '100%', gap: 16 },
  submitButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, width: '100%', alignItems: 'center' },
  lightSubmitButton: { backgroundColor: '#3B82F6' },
  darkSubmitButton: { backgroundColor: '#3B82F6' },
  verifyButton: { backgroundColor: '#10B981' },
  bypassButton: { backgroundColor: '#6B7280' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16 },
  message: { marginTop: 0, textAlign: 'center' },
  lightMessage: { color: '#4B5563' },
  darkMessage: { color: '#D1D5DB' },
  lightText: { color: '#1F2937' },
  darkText: { color: '#F9FAFB' }
});

export default Register;