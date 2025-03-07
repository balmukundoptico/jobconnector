// O:\JobConnector\mobileapp\pages\SeekerProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createSeekerProfile, updateSeekerProfile } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
  const [message, setMessage] = useState('');
  const [profileCreated, setProfileCreated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!route?.params?.user);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For button text toggle
  const navigation = useNavigation();
  const [submitScale] = useState(new Animated.Value(1));
  const [dashboardScale] = useState(new Animated.Value(1));

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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (name) => setFocusedField(name);
  const handleBlur = () => setFocusedField(null);

  const handleSubmitProfile = async () => {
    if (!formData.fullName) {
      setMessage('Please fill in full name');
      return;
    }
    setIsSubmitting(true);
    try {
      const profileData = {
        ...formData,
        skills: formData.skills || '',
        experience: formData.experience ? parseInt(formData.experience) : 0,
        currentCTC: formData.currentCTC ? parseInt(formData.currentCTC) : 0,
        expectedCTC: formData.expectedCTC ? parseInt(formData.expectedCTC) : 0,
      };
      console.log('Sending profile data to server:', profileData);
      let response;
      if (isEditMode) {
        response = await updateSeekerProfile({ ...profileData, _id: route.params.user._id });
      } else {
        response = await createSeekerProfile(profileData);
      }
      setMessage(response.data.message);
      setProfileCreated(true);
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      setMessage('Error saving profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    navigation.navigate('SeekerDashboard', { user: { ...route.params.user, ...formData } });
  };

  const handlePressIn = (scale) => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = (scale) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const renderInput = (label, name, type = 'text', placeholder, additionalProps = {}) => (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.label,
          isDarkMode ? styles.darkText : styles.lightText,
          (focusedField === name || formData[name]) ? styles.labelActive : styles.labelInactive,
          isDarkMode && (focusedField === name || formData[name]) ? styles.darkLabelActive : {},
          !isDarkMode && (focusedField === name || formData[name]) ? styles.lightLabelActive : {},
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isDarkMode ? styles.darkInput : styles.lightInput,
          focusedField === name ? styles.inputFocused : {},
          name === 'bio' ? styles.textArea : {},
        ]}
        value={formData[name]}
        onChangeText={(text) => handleChange(name, text)}
        onFocus={() => handleFocus(name)}
        onBlur={handleBlur}
        placeholder={focusedField === name ? placeholder : ''}
        placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        multiline={name === 'bio'}
        {...additionalProps}
      />
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title={isEditMode ? "Edit Seeker Profile" : "Create Seeker Profile"} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.main}>
          <View style={[styles.formContainer, isDarkMode ? styles.darkFormContainer : styles.lightFormContainer]}>
            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              {isEditMode ? "Update Your Profile" : "Create Seeker Profile"}
            </Text>
            {!profileCreated ? (
              <>
                {renderInput('Full Name', 'fullName', 'text', 'Enter full name', { required: true })}
                {renderInput('WhatsApp Number', 'whatsappNumber', 'text', 'Enter WhatsApp number')}
                {renderInput('Email', 'email', 'email', 'Enter email')}
                {renderInput('Skill Type', 'skillType', 'text', 'Enter skill type')}
                {renderInput('Skills', 'skills', 'text', 'Enter skills (comma-separated)')}
                {renderInput('Experience (years)', 'experience', 'number', 'Enter experience')}
                {renderInput('Location', 'location', 'text', 'Enter location')}
                {renderInput('Current CTC', 'currentCTC', 'number', 'Enter current CTC')}
                {renderInput('Expected CTC', 'expectedCTC', 'number', 'Enter expected CTC')}
                {renderInput('Notice Period', 'noticePeriod', 'text', 'Enter notice period')}
                {renderInput('Last Working Date', 'lastWorkingDate', 'text', 'YYYY-MM-DD')}
                {renderInput('Bio', 'bio', 'text', 'Enter bio', { multiline: true })}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmitProfile}
                  onPressIn={() => handlePressIn(submitScale)}
                  onPressOut={() => handlePressOut(submitScale)}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.buttonWrap, { transform: [{ scale: submitScale }] }]}>
                    <Text style={styles.buttonText}>
                      {isSubmitting ? 'Saving...' : 'Save Profile'}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={handleGoToDashboard}
                onPressIn={() => handlePressIn(dashboardScale)}
                onPressOut={() => handlePressOut(dashboardScale)}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.buttonWrap, { transform: [{ scale: dashboardScale }] }]}>
                  <Text style={styles.buttonText}>Go to Dashboard</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
            {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}
          </View>
        </View>
      </ScrollView>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Container (matches .flex.flex-col.min-h-screen.bg-gray-100.dark:bg-gray-900)
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  darkContainer: {
    backgroundColor: '#1F2937', // bg-gray-900
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Main (matches .flex-grow.flex.items-center.justify-center.p-4)
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Form Container (matches .bg-white.dark:bg-gray-800.p-6.rounded-lg.shadow-md.border.border-gray-200.dark:border-gray-700.w-full.max-w-md)
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
  },
  lightFormContainer: {
    backgroundColor: '#FFFFFF', // bg-white
    borderColor: '#E5E7EB', // border-gray-200
  },
  darkFormContainer: {
    backgroundColor: '#374151', // bg-gray-800
    borderColor: '#4B5563', // border-gray-700
  },
  // Title (matches .text-2xl.font-semibold.text-gray-900.dark:text-white.mb-6.text-center)
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  lightText: {
    color: '#1F2937', // text-gray-900
  },
  darkText: {
    color: '#F9FAFB', // text-white
  },
  // Input Container (matches .container.relative.flex.flex-col.gap-2.mb-6 and .container { min-height: 65px })
  inputContainer: {
    minHeight: 65,
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  // Label (matches .label.absolute.text-[15px].font-bold.pointer-events-none.transition-all.duration-300.dark:text-white.text-black.z-10.bg-gradient-to-b.from-transparent.via-white.to-transparent.dark:from-transparent.dark:via-gray-800.dark:to-transparent.px-1)
  label: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: '700',
    zIndex: 10,
    paddingHorizontal: 4,
  },
  labelInactive: {
    top: 13,
    left: 10,
  },
  labelActive: {
    top: -10,
    left: 10,
    transform: [{ translateY: -1 }],
  },
  lightLabelActive: {
    backgroundColor: '#FFFFFF', // via-white
  },
  darkLabelActive: {
    backgroundColor: '#374151', // via-gray-800
  },
  // Input (matches .input.w-full.h-[45px].rounded-md.p-2.text-[15px].bg-transparent.outline-none.border-none.dark:text-white.text-black.transition-all.duration-300)
  input: {
    width: '100%',
    height: 45,
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    backgroundColor: 'transparent',
    // Shadows from .input { box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4) }
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    shadowColor: '#FFF',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  lightInput: {
    backgroundColor: '#FFFFFF', // Adjusted for visibility
    color: '#1F2937', // text-black
  },
  darkInput: {
    backgroundColor: '#374151', // Adjusted for visibility
    color: '#F9FAFB', // text-white
  },
  // Input Focused (matches .input:focus { box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4) })
  inputFocused: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    shadowColor: '#FFF',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    // Inset shadows not supported in RN; outer shadows enhanced
  },
  textArea: {
    height: 100, // Matches .h-[100px] for bio
    textAlignVertical: 'top',
  },
  // Button (matches .button.w-full and all nested styles)
  button: {
    width: '100%',
    borderRadius: 100, // --radius: 100px
    backgroundColor: '#080808', // --bg: #080808
    // Shadows from .button { box-shadow: inset 0 0.3rem 0.9rem rgba(255, 255, 255, 0.3), ... }
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4.8 }, // 0.3rem = 4.8px
    shadowOpacity: 0.3,
    shadowRadius: 14.4, // 0.9rem = 14.4px
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1.6 }, // -0.1rem = -1.6px
    shadowOpacity: 0.7,
    shadowRadius: 4.8, // 0.3rem = 4.8px
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: -6.4 }, // -0.4rem = -6.4px
    shadowOpacity: 0.5,
    shadowRadius: 14.4, // 0.9rem = 14.4px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 48 }, // 3rem = 48px
    shadowOpacity: 0.3,
    shadowRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 }, // 1rem = 16px
    shadowOpacity: 0.8,
    shadowRadius: 9.6, // Adjusted for -0.6rem offset
  },
  buttonWrap: {
    fontSize: 25,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 32, // Matches .wrap padding: 32px 45px
    paddingHorizontal: 45,
    borderRadius: 100, // Matches inherit
    position: 'relative',
    overflow: 'hidden',
    // Mimics .wrap::before { background-color: rgba(255, 255, 255, 0.12) }
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SeekerProfile;