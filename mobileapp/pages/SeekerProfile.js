// O:\JobConnector\mobileapp\pages\SeekerProfile.js
import React, { useState, useEffect } from 'react'; // React core
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native'; // RN components
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import { createSeekerProfile, updateSeekerProfile, getProfile } from '../utils/api'; // API functions
import Header from '../components/Header'; // Reusable header
import Footer from '../components/Footer'; // Reusable footer

// SeekerProfile component with full fields and live backend
const SeekerProfile = ({ isDarkMode, toggleDarkMode, route }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: route?.params?.contact && !route?.params?.isEmail ? route.params.contact : '',
    email: route?.params?.contact && route?.params?.isEmail ? route.params.contact : '',
    skillType: 'IT',
    skills: '',
    experience: '',
    location: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    lastWorkingDate: '',
    bio: '',
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
        fullName: route.params.user.fullName || '',
        whatsappNumber: route.params.user.whatsappNumber || '',
        email: route.params.user.email || '',
        skillType: route.params.user.skillType || 'IT',
        skills: route.params.user.skills?.join(', ') || '',
        experience: route.params.user.experience?.toString() || '',
        location: route.params.user.location || '',
        currentCTC: route.params.user.currentCTC?.toString() || '',
        expectedCTC: route.params.user.expectedCTC?.toString() || '',
        noticePeriod: route.params.user.noticePeriod || '',
        lastWorkingDate: route.params.user.lastWorkingDate || '',
        bio: route.params.user.bio || '',
      });
    }
  }, [route, isEditMode]);

  // Handle form input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submitting the profile
  const handleSubmitProfile = async () => {
    if (!formData.fullName) {
      setMessage('Please fill in full name');
      return;
    }
    try {
      const profileData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        experience: formData.experience ? parseInt(formData.experience) : 0,
        currentCTC: formData.currentCTC ? parseInt(formData.currentCTC) : 0,
        expectedCTC: formData.expectedCTC ? parseInt(formData.expectedCTC) : 0,
      };
      let response;
      if (isEditMode) {
        response = await updateSeekerProfile({ ...profileData, _id: route.params.user._id }); // Update existing profile
      } else {
        response = await createSeekerProfile(profileData); // Create new profile
      }
      setMessage(response.data.message); // Show success message
      setProfileCreated(true); // Mark profile as created/updated
    } catch (error) {
      setMessage('Error saving profile: ' + error.message); // Show error
    }
  };

  // Handle navigating to SeekerDashboard
  const handleGoToDashboard = () => {
    navigation.navigate('SeekerDashboard', { user: { ...route.params.user, ...formData } }); // Pass updated user data
  };

  // Animation handlers
  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  // Render UI
  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title={isEditMode ? "Edit Seeker Profile" : "Create Seeker Profile"} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          {isEditMode ? "Update Your Profile" : "Set Up Your Seeker Profile"}
        </Text>
        {!profileCreated ? (
          <>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              placeholder="Full Name"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.whatsappNumber}
              onChangeText={(text) => handleChange('whatsappNumber', text)}
              placeholder="WhatsApp Number"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.skillType}
              onChangeText={(text) => handleChange('skillType', text)}
              placeholder="Skill Type (IT/Non-IT)"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.skills}
              onChangeText={(text) => handleChange('skills', text)}
              placeholder="Skills (comma-separated)"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.experience}
              onChangeText={(text) => handleChange('experience', text)}
              placeholder="Experience (years)"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              placeholder="Location"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.currentCTC}
              onChangeText={(text) => handleChange('currentCTC', text)}
              placeholder="Current CTC"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.expectedCTC}
              onChangeText={(text) => handleChange('expectedCTC', text)}
              placeholder="Expected CTC"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.noticePeriod}
              onChangeText={(text) => handleChange('noticePeriod', text)}
              placeholder="Notice Period"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.lastWorkingDate}
              onChangeText={(text) => handleChange('lastWorkingDate', text)}
              placeholder="Last Working Date (YYYY-MM-DD)"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              placeholder="Bio"
              multiline
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

export default SeekerProfile;