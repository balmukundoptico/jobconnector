// O:\JobConnector\mobileapp\pages\AdminDashboard.js
import React, { useState, useEffect } from 'react'; // React core
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Modal } from 'react-native'; // RN components
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import * as DocumentPicker from 'expo-document-picker'; // File picker
import { getProfile, uploadExcel, searchSeekers, searchJobs, deleteSeeker, deleteJob, updateSeekerProfile, updateProviderProfile } from '../utils/api'; // API functions
import Header from '../components/Header'; // Reusable header
import Footer from '../components/Footer'; // Reusable footer

// AdminDashboard component with full CRUD
export default function AdminDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null); // User from navigation state
  const [file, setFile] = useState(null); // Selected Excel file
  const [uploadFileName, setUploadFileName] = useState(''); // Display file name
  const [type, setType] = useState('seekers'); // Upload type (seekers/jobs/providers)
  const [message, setMessage] = useState(''); // Message display
  const [seekers, setSeekers] = useState([]); // Seekers list
  const [jobs, setJobs] = useState([]); // Jobs list
  const [stats, setStats] = useState({ seekers: 0, providers: 0, jobs: 0 }); // Stats
  const [editSeeker, setEditSeeker] = useState(null); // Seeker being edited
  const [editJob, setEditJob] = useState(null); // Job being edited
  const navigation = useNavigation(); // Navigation instance
  const [uploadScale] = useState(new Animated.Value(1)); // Animation scales
  const [logoutScale] = useState(new Animated.Value(1));
  const [deleteScales, setDeleteScales] = useState({});
  const [editScales, setEditScales] = useState({});

  // Fetch data on mount
  useEffect(() => {
    if (!route?.params?.contact) {
      navigation.navigate('AuthForm', { role: 'admin' }); // Redirect if no contact
      return;
    }
    fetchData(); // Load initial data
  }, [route, navigation]);

  // Fetch admin data
  const fetchData = async () => {
    try {
      if (!user) { // Fetch profile if not provided
        const isEmail = route.params.contact.includes('@');
        const response = await getProfile({
          role: 'admin',
          ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
        });
        setUser(response.data); // Set admin user
      }
      const seekersResponse = await searchSeekers({}); // Fetch seekers
      const jobsResponse = await searchJobs({}); // Fetch jobs
      setSeekers(seekersResponse.data); // Update seekers
      setJobs(jobsResponse.data); // Update jobs
      setStats({ // Update stats
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

  // Handle file selection
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (!result.canceled) {
        setFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'upload.xlsx',
          type: result.assets[0].mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        setUploadFileName(result.assets[0].name); // Show file name
      }
    } catch (error) {
      setMessage('Error selecting file: ' + error.message);
    }
  };

  // Handle Excel upload
  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file); // Add file to form data
    formData.append('type', type); // Add upload type
    try {
      const response = await uploadExcel(formData); // Live backend call
      setMessage(`${response.data.message} - ${type === 'seekers' ? response.data.seekersCount : response.data.jobsCount || 0} records imported`);
      setFile(null); // Reset file
      setUploadFileName(''); // Clear file name
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('Error uploading Excel: ' + error.message);
    }
  };

  // Handle deleting a seeker
  const handleDeleteSeeker = async (seekerId) => {
    try {
      const response = await deleteSeeker({ seekerId }); // Live backend call
      setMessage(response.data.message); // Show success
      setSeekers(seekers.filter(seeker => seeker._id !== seekerId)); // Update list
      setStats(prev => ({ ...prev, seekers: prev.seekers - 1 })); // Update stats
    } catch (error) {
      setMessage('Error deleting seeker: ' + error.message);
    }
  };

  // Handle deleting a job
  const handleDeleteJob = async (jobId) => {
    try {
      const response = await deleteJob({ jobId }); // Live backend call
      setMessage(response.data.message); // Show success
      setJobs(jobs.filter(job => job._id !== jobId)); // Update list
      setStats(prev => ({ ...prev, jobs: prev.jobs - 1 })); // Update stats
    } catch (error) {
      setMessage('Error deleting job: ' + error.message);
    }
  };

  // Handle editing a seeker
  const handleEditSeeker = (seeker) => {
    setEditSeeker(seeker); // Open edit modal
  };

  // Handle saving seeker edits
  const handleSaveSeeker = async () => {
    try {
      const response = await updateSeekerProfile({ ...editSeeker }); // Live backend call
      setMessage(response.data.message); // Show success
      setSeekers(seekers.map(s => s._id === editSeeker._id ? editSeeker : s)); // Update list
      setEditSeeker(null); // Close modal
    } catch (error) {
      setMessage('Error updating seeker: ' + error.message);
    }
  };

  // Handle editing a job
  const handleEditJob = (job) => {
    setEditJob(job); // Open edit modal
  };

  // Handle saving job edits
  const handleSaveJob = async () => {
    try {
      const response = await updateProviderProfile({ ...editJob, postedBy: editJob.postedBy._id }); // Assuming job update via provider endpoint
      setMessage(response.data.message); // Show success
      setJobs(jobs.map(j => j._id === editJob._id ? editJob : j)); // Update list
      setEditJob(null); // Close modal
    } catch (error) {
      setMessage('Error updating job: ' + error.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    navigation.navigate('Home'); // Simple logout
  };

  // Animation handlers
  const handlePressIn = (scale) => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); };
  const handlePressOut = (scale) => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); };

  // Render UI
  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Admin Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
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

            {/* Seeker Edit Modal */}
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

            {/* Job Edit Modal */}
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
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  content: { flex: 1, padding: 10 },
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