// O:\JobConnector\mobileapp\pages\AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Modal, ScrollView } from 'react-native'; // Added ScrollView
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getProfile, uploadExcel, searchSeekers, searchJobs, deleteSeeker, deleteJob, updateSeekerProfile, updateProviderProfile } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null);
  const [file, setFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [type, setType] = useState('seekers');
  const [message, setMessage] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ seekers: 0, providers: 0, jobs: 0 });
  const [editSeeker, setEditSeeker] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const navigation = useNavigation();
  const [uploadScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));
  const [deleteScales, setDeleteScales] = useState({});
  const [editScales, setEditScales] = useState({});

  useEffect(() => {
    if (!route?.params?.contact) {
      navigation.navigate('AuthForm', { role: 'admin' });
      return;
    }
    fetchData();
  }, [route, navigation]);

  const fetchData = async () => {
    try {
      if (!user) {
        const isEmail = route.params.contact.includes('@');
        const response = await getProfile({
          role: 'admin',
          ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
        });
        setUser(response.data);
      }
      const seekersResponse = await searchSeekers({});
      const jobsResponse = await searchJobs({});
      setSeekers(seekersResponse.data);
      setJobs(jobsResponse.data);
      setStats({
        seekers: seekersResponse.data.length,
        jobs: jobsResponse.data.length,
        providers: new Set(jobsResponse.data.map(job => job.postedBy?._id)).size,
      });
      const scales = {};
      seekersResponse.data.forEach(seeker => {
        scales[seeker._id] = { delete: new Animated.Value(1), edit: new Animated.Value(1) };
      });
      jobsResponse.data.forEach(job => {
        scales[job._id] = { delete: new Animated.Value(1), edit: new Animated.Value(1) };
      });
      setDeleteScales(scales);
      setEditScales(scales);
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (!result.canceled) {
        setFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'upload.xlsx',
          type: result.assets[0].mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        setUploadFileName(result.assets[0].name);
      }
    } catch (error) {
      setMessage('Error selecting file: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      const response = await uploadExcel(formData);
      setMessage(`${response.data.message} - ${type === 'seekers' ? response.data.seekersCount : response.data.jobsCount || 0} records imported`);
      setFile(null);
      setUploadFileName('');
      fetchData();
    } catch (error) {
      setMessage('Error uploading Excel: ' + error.message);
    }
  };

  const handleDeleteSeeker = async (seekerId) => {
    try {
      const response = await deleteSeeker({ seekerId });
      setMessage(response.data.message);
      setSeekers(seekers.filter(seeker => seeker._id !== seekerId));
      setStats(prev => ({ ...prev, seekers: prev.seekers - 1 }));
    } catch (error) {
      setMessage('Error deleting seeker: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const response = await deleteJob({ jobId });
      setMessage(response.data.message);
      setJobs(jobs.filter(job => job._id !== jobId));
      setStats(prev => ({ ...prev, jobs: prev.jobs - 1 }));
    } catch (error) {
      setMessage('Error deleting job: ' + error.message);
    }
  };

  const handleEditSeeker = (seeker) => {
    setEditSeeker(seeker);
  };

  const handleSaveSeeker = async () => {
    try {
      const response = await updateSeekerProfile({ ...editSeeker });
      setMessage(response.data.message);
      setSeekers(seekers.map(s => s._id === editSeeker._id ? editSeeker : s));
      setEditSeeker(null);
    } catch (error) {
      setMessage('Error updating seeker: ' + error.message);
    }
  };

  const handleEditJob = (job) => {
    setEditJob(job);
  };

  const handleSaveJob = async () => {
    try {
      const response = await updateProviderProfile({ ...editJob, postedBy: editJob.postedBy._id });
      setMessage(response.data.message);
      setJobs(jobs.map(j => j._id === editJob._id ? editJob : j));
      setEditJob(null);
    } catch (error) {
      setMessage('Error updating job: ' + error.message);
    }
  };

  const handleLogout = () => {
    navigation.navigate('Home');
  };

  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Admin Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {user ? (
            <>
              <Text style={[styles.welcome, isDarkMode ? styles.darkText : styles.lightText]}>
                Welcome, {user.fullName || 'Admin'}!
              </Text>
              <View style={styles.stats}>
                <Text style={[styles.statText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Total Job Seekers: {stats.seekers}
                </Text>
                <Text style={[styles.statText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Total Job Providers: {stats.providers}
                </Text>
                <Text style={[styles.statText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Total Jobs: {stats.jobs}
                </Text>
              </View>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Upload Excel Data</Text>
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'seekers' && styles.selectedButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                  onPress={() => setType('seekers')}
                >
                  <Text style={styles.buttonText}>Seekers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'jobs' && styles.selectedButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                  onPress={() => setType('jobs')}
                >
                  <Text style={styles.buttonText}>Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'providers' && styles.selectedButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                  onPress={() => setType('providers')}
                >
                  <Text style={styles.buttonText}>Providers</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>
                {uploadFileName ? `Selected: ${uploadFileName}` : 'No file selected'}
              </Text>
              <TouchableOpacity
                style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                onPress={handleFilePick}
                onPressIn={() => handlePressIn(uploadScale)}
                onPressOut={() => handlePressOut(uploadScale)}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: uploadScale }] }]}>
                  <Text style={styles.buttonText}>Pick Excel File</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                onPress={handleUpload}
                onPressIn={() => handlePressIn(uploadScale)}
                onPressOut={() => handlePressOut(uploadScale)}
                activeOpacity={0.8}
                disabled={!file}
              >
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: uploadScale }] }]}>
                  <Text style={styles.buttonText}>Upload</Text>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Job Seekers</Text>
              <FlatList
                data={seekers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                      {item.fullName} ({item.email || 'No email'})
                    </Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                        onPress={() => handleEditSeeker(item)}
                        onPressIn={() => handlePressIn(editScales[item._id]?.edit)}
                        onPressOut={() => handlePressOut(editScales[item._id]?.edit)}
                        activeOpacity={0.8}
                      >
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: editScales[item._id]?.edit || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>Edit</Text>
                        </Animated.View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                        onPress={() => handleDeleteSeeker(item._id)}
                        onPressIn={() => handlePressIn(deleteScales[item._id]?.delete)}
                        onPressOut={() => handlePressOut(deleteScales[item._id]?.delete)}
                        activeOpacity={0.8}
                      >
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: deleteScales[item._id]?.delete || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>Delete</Text>
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Posted Jobs</Text>
              <FlatList
                data={jobs}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                      {item.jobTitle} - {item.postedBy?.companyName || 'Unknown'}
                    </Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                        onPress={() => handleEditJob(item)}
                        onPressIn={() => handlePressIn(editScales[item._id]?.edit)}
                        onPressOut={() => handlePressOut(editScales[item._id]?.edit)}
                        activeOpacity={0.8}
                      >
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: editScales[item._id]?.edit || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>Edit</Text>
                        </Animated.View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                        onPress={() => handleDeleteJob(item._id)}
                        onPressIn={() => handlePressIn(deleteScales[item._id]?.delete)}
                        onPressOut={() => handlePressOut(deleteScales[item._id]?.delete)}
                        activeOpacity={0.8}
                      >
                        <Animated.View style={[styles.buttonInner, { transform: [{ scale: deleteScales[item._id]?.delete || new Animated.Value(1) }] }]}>
                          <Text style={styles.buttonText}>Delete</Text>
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity
                style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                onPress={handleLogout}
                onPressIn={() => handlePressIn(logoutScale)}
                onPressOut={() => handlePressOut(logoutScale)}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.buttonInner, { transform: [{ scale: logoutScale }] }]}>
                  <Text style={styles.buttonText}>Logout</Text>
                </Animated.View>
              </TouchableOpacity>
              {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}

              <Modal visible={!!editSeeker} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                    <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Edit Seeker</Text>
                    <TextInput
                      style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                      value={editSeeker?.fullName || ''}
                      onChangeText={(text) => setEditSeeker({ ...editSeeker, fullName: text })}
                      placeholder="Full Name"
                    />
                    <TextInput
                      style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                      value={editSeeker?.whatsappNumber || ''}
                      onChangeText={(text) => setEditSeeker({ ...editSeeker, whatsappNumber: text })}
                      placeholder="WhatsApp Number"
                    />
                    <TextInput
                      style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                      value={editSeeker?.email || ''}
                      onChangeText={(text) => setEditSeeker({ ...editSeeker, email: text })}
                      placeholder="Email"
                    />
                    <TouchableOpacity
                      style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={handleSaveSeeker}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={() => setEditSeeker(null)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Modal visible={!!editJob} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                    <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Edit Job</Text>
                    <TextInput
                      style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                      value={editJob?.jobTitle || ''}
                      onChangeText={(text) => setEditJob({ ...editJob, jobTitle: text })}
                      placeholder="Job Title"
                    />
                    <TextInput
                      style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                      value={editJob?.skills?.join(', ') || ''}
                      onChangeText={(text) => setEditJob({ ...editJob, skills: text.split(', ') })}
                      placeholder="Skills"
                    />
                    <TouchableOpacity
                      style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={handleSaveJob}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={() => setEditJob(null)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
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
  scrollContent: { paddingBottom: 60,flexGrow: 1 },
  content: { padding: 10, flexGrow: 1 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  stats: { marginBottom: 20 },
  statText: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 14, marginBottom: 10 },
  uploadContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  typeButton: { padding: 10, borderRadius: 5 },
  selectedButton: { backgroundColor: '#003F87' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  itemText: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { padding: 5, borderRadius: 5 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center' },
  loading: { fontSize: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, borderRadius: 10 },
  lightModal: { backgroundColor: '#fff' },
  darkModal: { backgroundColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' }
});