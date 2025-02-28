// O:\JobConnector\mobileapp\pages\ProviderProfile.js
import React, { useState, useEffect } from 'react'; // React core
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native'; // RN components
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import { createProviderProfile, updateProviderProfile } from '../utils/api'; // API functions
import Header from '../components/Header'; // Reusable header
import Footer from '../components/Footer'; // Reusable footer

// ProviderProfile component with full fields and live backend
const ProviderProfile = ({ isDarkMode, toggleDarkMode, route }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    hrWhatsappNumber: route?.params?.contact && !route?.params?.isEmail ? route.params.contact : '',
    email: route?.params?.contact && route?.params?.isEmail ? route.params.contact : '',
  });
  const [message, setMessage] = useState(''); // Success/error message
  const [profileCreated, setProfileCreated] = useState(false); // Tracks if profile is saved
  const [isEditMode, setIsEditMode] = useState(!!route?.params?.user); // Edit mode if user exists
  const navigation = useNavigation(); // Navigation instance
  const [submitScale] = useState(new Animated.Value(1)); // Animation scale for submit button
  const [dashboardScale] = useState(new Animated.Value(1)); // Animation scale for dashboard button

  // Fetch existing profile if in edit mode
  useEffect(() => {
    if (isEditMode && route?.params?.user) {
      setFormData({
        companyName: route.params.user.companyName || '',
        hrName: route.params.user.hrName || '',
        hrWhatsappNumber: route.params.user.hrWhatsappNumber || '',
        email: route.params.user.email || '',
      });
    }
  }, [route, isEditMode]);

  // Handle form input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submitting the profile
  const handleSubmitProfile = async () => {
    if (!formData.companyName || !formData.hrName) {
      setMessage('Please fill in company name and HR name');
      return;
    }
    try {
      let response;
      if (isEditMode) {
        response = await updateProviderProfile({ ...formData, _id: route.params.user._id }); // Update existing profile
      } else {
        response = await createProviderProfile(formData); // Create new profile
      }
      setMessage(response.data.message); // Show success message
      setProfileCreated(true); // Mark profile as created/updated
    } catch (error) {
      setMessage('Error saving profile: ' + error.message); // Show error
    }
  };

  // Handle navigating to ProviderDashboard
  const handleGoToDashboard = () => {
    navigation.navigate('ProviderDashboard', { user: { ...route.params.user, ...formData } }); // Pass updated user data
  };

  // Animation handlers
  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  // Render UI
  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title={isEditMode ? "Edit Provider Profile" : "Create Provider Profile"} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          {isEditMode ? "Update Your Profile" : "Set Up Your Provider Profile"}
        </Text>
        {!profileCreated ? (
          <>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.companyName}
              onChangeText={(text) => handleChange('companyName', text)}
              placeholder="Company Name"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.hrName}
              onChangeText={(text) => handleChange('hrName', text)}
              placeholder="HR Name"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.hrWhatsappNumber}
              onChangeText={(text) => handleChange('hrWhatsappNumber', text)}
              placeholder="HR WhatsApp Number"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleSubmitProfile}
              onPressIn={() => handlePressIn(submitScale)}
              onPressOut={() => handlePressOut(submitScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: submitScale }] }]}>
                <Text style={styles.buttonText}>Save Profile</Text>
              </Animated.View>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={handleGoToDashboard}
            onPressIn={() => handlePressIn(dashboardScale)}
            onPressOut={() => handlePressOut(dashboardScale)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.buttonInner, { transform: [{ scale: dashboardScale }] }]}>
              <Text style={styles.buttonText}>Go to Dashboard</Text>
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
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' }
});

export default ProviderProfile;