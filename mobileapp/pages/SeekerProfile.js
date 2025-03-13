import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
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
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [message, setMessage] = useState('');
  const [profileCreated, setProfileCreated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!route?.params?.user);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const [submitScale] = useState(new Animated.Value(1));
  const [dashboardScale] = useState(new Animated.Value(1));
  const [uploadScale] = useState(new Animated.Value(1));

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
      setResumeFileName(route.params.user.resume ? route.params.user.resume.split('/').pop() : '');
    }
  }, [route, isEditMode]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (name) => setFocusedField(name);
  const handleBlur = () => setFocusedField(null);

  const handleFilePick = async () => {
    try {
      console.log('Picking resume file...');
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });
      console.log('Picker result:', JSON.stringify(result, null, 2));
      if (!result.canceled && result.assets) {
        const selectedFile = result.assets[0];
        let fileData;
        if (Platform.OS === 'web') {
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          fileData = new File([blob], selectedFile.name || 'resume.pdf', {
            type: selectedFile.mimeType || 'application/pdf',
          });
        } else {
          fileData = {
            uri: selectedFile.uri,
            name: selectedFile.name || 'resume.pdf',
            type: selectedFile.mimeType || 'application/pdf',
          };
        }
        setResumeFile(fileData);
        setResumeFileName(selectedFile.name);
        setMessage('');
      } else {
        setMessage('No file selected');
      }
    } catch (error) {
      console.error('handleFilePick error:', error);
      setMessage('Error selecting file: ' + error.message);
      setResumeFile(null);
      setResumeFileName('');
    }
  };

  const handleSubmitProfile = async () => {
    if (!formData.fullName) {
      setMessage('Please fill in full name');
      return;
    }
    setIsSubmitting(true);
    try {
      const profileData = new FormData();
      profileData.append('fullName', formData.fullName);
      profileData.append('whatsappNumber', formData.whatsappNumber || '');
      profileData.append('email', formData.email || '');
      profileData.append('skillType', formData.skillType || 'IT');
      profileData.append('skills', formData.skills || '');
      profileData.append('experience', formData.experience ? parseInt(formData.experience) : 0);
      profileData.append('location', formData.location || '');
      profileData.append('currentCTC', formData.currentCTC ? parseInt(formData.currentCTC) : 0);
      profileData.append('expectedCTC', formData.expectedCTC ? parseInt(formData.expectedCTC) : 0);
      profileData.append('noticePeriod', formData.noticePeriod || '');
      profileData.append('lastWorkingDate', formData.lastWorkingDate || '');
      profileData.append('bio', formData.bio || '');

      if (resumeFile) {
        if (Platform.OS === 'web') {
          profileData.append('resume', resumeFile, resumeFileName);
        } else {
          profileData.append('resume', {
            uri: resumeFile.uri,
            name: resumeFile.name,
            type: resumeFile.type,
          });
        }
        console.log('Resume file appended:', { uri: resumeFile.uri, name: resumeFile.name, type: resumeFile.type });
      }

      if (isEditMode) {
        profileData.append('_id', route.params.user._id);
      }

      console.log('Sending profile data to server:', [...profileData.entries()]);
      let response;
      // if (isEditMode) {
      //   response = await updateSeekerProfile(profileData);
      // } else {
      //   response = await createSeekerProfile(profileData);
      // }

      if (isEditMode) {
        response = await updateSeekerProfile({ ...profileData, _id: route.params.user._id });
      } else {
        response = await createSeekerProfile(profileData);
      }

      setMessage(response.data.message);
      setProfileCreated(true);
      Alert.alert('Success', 'Profile saved successfully!');
      setResumeFile(null);
      setResumeFileName('');
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      setMessage('Error saving profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated handleGoToDashboard to match ProviderProfile behavior
  const handleGoToDashboard = () => {
    navigation.navigate('SeekerDashboard', { user: { ...route.params.user, ...formData } });
  };

  const handlePressIn = (scale) => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = (scale) => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const renderInput = (label, name, type = 'text', placeholder, additionalProps = {}) => (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.label,
          isDarkMode ? styles.darkText : styles.lightText,
          focusedField === name || formData[name] ? styles.labelActive : styles.labelInactive,
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
      <Header
        title={isEditMode ? 'Edit Seeker Profile' : 'Create Seeker Profile'}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.main}>
          <View style={[styles.formContainer, isDarkMode ? styles.darkFormContainer : styles.lightFormContainer]}>
            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              {isEditMode ? 'Update Your Profile' : 'Create Seeker Profile'}
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

                <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>
                  {resumeFileName ? `Selected: ${resumeFileName}` : 'Upload Resume (PDF/DOCX)'}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleFilePick}
                  onPressIn={() => handlePressIn(uploadScale)}
                  onPressOut={() => handlePressOut(uploadScale)}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.buttonWrap, { transform: [{ scale: uploadScale }] }]}>
                    <Text style={styles.buttonText}>Pick Resume File</Text>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmitProfile}
                  onPressIn={() => handlePressIn(submitScale)}
                  onPressOut={() => handlePressOut(submitScale)}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Animated.View style={[styles.buttonWrap, { transform: [{ scale: submitScale }] }]}>
                    <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Save Profile'}</Text>
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
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#F3F4F6' },
  darkContainer: { backgroundColor: '#1F2937' },
  scrollContent: { flexGrow: 1 },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
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
  lightFormContainer: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  darkFormContainer: { backgroundColor: '#222', borderColor: '#4B5563' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 10 },
  lightText: { color: '#1F2937' },
  darkText: { color: '#F9FAFB' },
  inputContainer: { minHeight: 65, width: '100%', marginBottom: 24, position: 'relative' },
  label: { position: 'absolute', fontSize: 15, fontWeight: '700', zIndex: 10, paddingHorizontal: 4 },
  labelInactive: { top: 13, left: 10 },
  labelActive: { top: -10, left: 10, transform: [{ translateY: -1 }] },
  lightLabelActive: { backgroundColor: '#FFFFFF' },
  darkLabelActive: { backgroundColor: '#222' },
  input: {
    width: '100%',
    height: 45,
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    backgroundColor: 'transparent',
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
  lightInput: { backgroundColor: '#FFFFFF', color: '#1F2937' },
  darkInput: { backgroundColor: '#374151', color: '#F9FAFB' },
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
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    width: '100%',
    borderRadius: 100,
    backgroundColor: '#080808',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4.8 },
    shadowOpacity: 0.3,
    shadowRadius: 14.4,
    elevation: 5,
  },
  buttonWrap: {
    paddingVertical: 32,
    paddingHorizontal: 45,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  message: { marginTop: 8, textAlign: 'center' },
});

export default SeekerProfile;