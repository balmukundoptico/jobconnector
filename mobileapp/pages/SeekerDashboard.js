// O:\JobConnector\mobileapp\pages\SeekerDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Linking, ScrollView } from 'react-native'; // Added ScrollView
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getProfile, searchJobs, updateSeekerProfile, saveSearch, applyToJob } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SeekerDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [message, setMessage] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigation = useNavigation();
  const [applyScales, setApplyScales] = useState({});
  const [connectScales, setConnectScales] = useState({});
  const [profileScale] = useState(new Animated.Value(1));
  const [uploadScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!route?.params?.contact) {
      navigation.navigate('AuthForm', { role: 'seeker' });
      return;
    }
    fetchData();
  }, [route, navigation]);

  const fetchData = async () => {
    try {
      if (!user) {
        const isEmail = route.params.contact.includes('@');
        const response = await getProfile({
          role: 'seeker',
          ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
        });
        setUser(response.data);
        setAppliedJobs(response.data.appliedJobs || []);
      }
      const response = await searchJobs({});
      setJobs(response.data.map(job => ({
        ...job,
        applied: appliedJobs.some(applied => applied.jobId === job._id),
      })));
      const scales = {};
      response.data.forEach(job => {
        scales[job._id] = { apply: new Animated.Value(1), connect: new Animated.Value(1) };
      });
      setApplyScales(scales);
      setConnectScales(scales);
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const response = await applyToJob({ seekerId: user._id, jobId });
      setAppliedJobs(prev => [...prev, { jobId, title: jobs.find(job => job._id === jobId).jobTitle, status: 'Applied' }]);
      setJobs(prev => prev.map(job => job._id === jobId ? { ...job, applied: true } : job));
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error applying to job: ' + error.message);
    }
  };

  const handleWhatsAppConnect = (number, jobTitle) => {
    const defaultMessage = `Hi, I'm interested in your job posting: ${jobTitle}`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=${number.replace(/\D/g, '')}&text=${encodeURIComponent(defaultMessage)}`);
    setAppliedJobs(prev => [...prev, { jobId: jobTitle, title: jobTitle, status: 'Connected' }]);
    setMessage(`Connected via WhatsApp for ${jobTitle}`);
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf,application/msword' });
      if (!result.canceled) {
        const formData = new FormData();
        formData.append('resume', {
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'resume.pdf',
          type: result.assets[0].mimeType || 'application/pdf',
        });
        setResumeFileName(result.assets[0].name);
        const response = await updateSeekerProfile({ ...user, resume: formData });
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Error uploading resume: ' + error.message);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('SeekerProfile', { user });
  };

  const handleLogout = () => {
    navigation.navigate('Home');
  };

  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Seeker Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {user ? (
            <>
              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Job Search</Text>
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search jobs..." placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <FlatList
                data={jobs.filter(job => job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.jobItem}>
                    <Text style={[styles.jobText, isDarkMode ? styles.darkText : styles.lightText]}>{item.jobTitle} - {item.postedBy.companyName}</Text>
                    <View style={styles.jobActions}>
                      <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton, item.applied && styles.disabledButton]} onPress={() => handleApply(item._id)} onPressIn={() => handlePressIn(applyScales[item._id]?.apply)} onPressOut={() => handlePressOut(applyScales[item._id]?.apply)} activeOpacity={0.8} disabled={item.applied}>
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: applyScales[item._id]?.apply || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>{item.applied ? 'Applied' : 'Apply'}</Text>
                        </Animated.View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => handleWhatsAppConnect(item.postedBy.hrWhatsappNumber, item.jobTitle)} onPressIn={() => handlePressIn(connectScales[item._id]?.connect)} onPressOut={() => handlePressOut(connectScales[item._id]?.connect)} activeOpacity={0.8}>
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: connectScales[item._id]?.connect || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>WhatsApp</Text>
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                scrollEnabled={false} // Disable FlatList scrolling
              />

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Upload Resume</Text>
              <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>{resumeFileName ? `Selected: ${resumeFileName}` : 'No resume selected'}</Text>
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleUploadResume} onPressIn={() => handlePressIn(uploadScale)} onPressOut={() => handlePressOut(uploadScale)} activeOpacity={0.8}>
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: uploadScale }] }]}>
                  <Text style={styles.buttonText}>Upload Resume</Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleEditProfile} onPressIn={() => handlePressIn(profileScale)} onPressOut={() => handlePressOut(profileScale)} activeOpacity={0.8}>
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: profileScale }] }]}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleLogout} onPressIn={() => handlePressIn(logoutScale)} onPressOut={() => handlePressOut(logoutScale)} activeOpacity={0.8}>
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: logoutScale }] }]}>
                  <Text style={styles.buttonText}>Logout</Text>
                </Animated.View>
              </TouchableOpacity>
              {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}
            </>
          ) : (
            <Text style={[styles.loading, isDarkMode ? styles.darkText : styles.lightText]}>Loading profile...</Text>
          )}
        </View>
      </ScrollView>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  scrollContent: { paddingBottom: 60, flexGrow: 1 }, // Updated for scrolling
  content: { padding: 10, flexGrow: 1 }, // Updated for scrolling
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  jobItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  jobText: { fontSize: 16 },
  jobActions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  actionButton: { padding: 5, borderRadius: 5 },
  disabledButton: { backgroundColor: '#666' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center' },
  loading: { fontSize: 16, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' }
});