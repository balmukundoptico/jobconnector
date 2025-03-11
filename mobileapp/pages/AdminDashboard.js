import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Modal, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getProfile, uploadExcel, searchSeekers, searchJobs, deleteSeeker, deleteJob, updateSeekerProfile, updateJob } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminDashboard({ isDarkMode, toggleDarkMode, route }) {
  const navigation = useNavigation();
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
  const [loading, setLoading] = useState(false);
  const [uploadScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));
  const [deleteScales, setDeleteScales] = useState({});
  const [editScales, setEditScales] = useState({});

  useEffect(() => {
    if (!route?.params?.contact) {
      console.log('No contact provided, redirecting to AuthForm');
      navigation.navigate('AuthForm', { role: 'admin' });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user) {
          const isEmail = route.params.contact.includes('@');
          console.log('Fetching user profile with:', { role: 'admin', contact: route.params.contact });
          const response = await getProfile({
            role: 'admin',
            ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
          });
          console.log('User profile response:', response.data);
          setUser(response.data);
        }

        console.log('Fetching seekers...');
        const seekersResponse = await searchSeekers({});
        console.log('Seekers response:', seekersResponse.data);

        console.log('Fetching jobs...');
        const jobsResponse = await searchJobs({});
        console.log('Jobs response:', JSON.stringify(jobsResponse.data, null, 2));

        setSeekers(seekersResponse.data || []);
        setJobs(jobsResponse.data || []);
        setStats({
          seekers: seekersResponse.data.length,
          jobs: jobsResponse.data.length,
          providers: new Set(jobsResponse.data.map(job => job.postedBy?._id)).size || 0,
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
        console.error('Error fetching data:', error.message, error.stack);
        setMessage('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, route, navigation]);

  const handleFilePick = async () => {
    try {
      console.log('Picking file...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      });
      console.log('Picker result:', JSON.stringify(result, null, 2));
      if (!result.canceled && result.assets) {
        const selectedFile = result.assets[0];
        let fileData;
        if (Platform.OS === 'web') {
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          fileData = new File([blob], selectedFile.name || 'upload.xlsx', {
            type: selectedFile.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          console.log('Web file picked:', fileData.name, fileData.type, fileData.size);
        } else {
          fileData = {
            uri: selectedFile.uri,
            name: selectedFile.name || 'upload.xlsx',
            type: selectedFile.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          console.log('Mobile file picked:', fileData.uri, fileData.name, fileData.type);
        }
        setFile(fileData);
        setUploadFileName(selectedFile.name);
        setMessage('');
      } else {
        setMessage('No file selected');
        console.log('File pick canceled');
      }
    } catch (error) {
      console.error('handleFilePick error:', error.message, error.stack);
      setMessage('Error selecting file: ' + error.message);
      setFile(null);
      setUploadFileName('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      console.log('No file selected for upload');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (Platform.OS === 'web') {
      console.log('Appending File for web:', file.name, file.type, file.size);
      formData.append('file', file);
    } else {
      console.log('Appending file for mobile:', file.uri, file.name, file.type);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
    }
    formData.append('type', type);

    try {
      console.log('Uploading file:', file.name, 'with type:', type);
      const response = await uploadExcel(formData);
      console.log('Upload response:', response);

      // Show success message after successful upload
      Alert.alert(
        'Success',
        'Data uploaded successfully!',
        [{ text: 'OK', onPress: () => console.log('Success alert closed') }]
      );

      setMessage(''); // Clear any previous message
      setFile(null);
      setUploadFileName('');

      // Refresh data immediately
      const seekersResponse = await searchSeekers({});
      const jobsResponse = await searchJobs({});
      setSeekers(seekersResponse.data || []);
      setJobs(jobsResponse.data || []);
      setStats({
        seekers: seekersResponse.data.length,
        jobs: jobsResponse.data.length,
        providers: new Set(jobsResponse.data.map(job => job.postedBy?._id)).size || 0,
      });
    } catch (error) {
      console.error('handleUpload error:', error.message, error.stack);
      Alert.alert('Upload Error', error.message || 'Error uploading Excel');
      setMessage(''); // Clear message on error too
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeeker = async (seekerId) => {
    try {
      console.log('Deleting seeker:', seekerId);
      await deleteSeeker({ seekerId });
      setSeekers(seekers.filter(seeker => seeker._id !== seekerId));
      setStats(prev => ({ ...prev, seekers: prev.seekers - 1 }));
      setMessage('Seeker deleted successfully');
    } catch (error) {
      console.error('handleDeleteSeeker error:', error.message, error.stack);
      setMessage('Error deleting seeker: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      console.log('Deleting job:', jobId);
      await deleteJob({ jobId });
      setJobs(jobs.filter(job => job._id !== jobId));
      setStats(prev => ({ ...prev, jobs: prev.jobs - 1 }));
      setMessage('Job deleted successfully');
    } catch (error) {
      console.error('handleDeleteJob error:', error.message, error.stack);
      setMessage('Error deleting job: ' + error.message);
    }
  };

  const handleEditSeeker = (seeker) => {
    try {
      console.log('Editing seeker:', seeker._id);
      setEditSeeker({ ...seeker });
    } catch (error) {
      console.error('handleEditSeeker error:', error.message, error.stack);
      setMessage('Error preparing seeker edit: ' + error.message);
    }
  };

  const handleSaveSeeker = async () => {
    try {
      console.log('Saving seeker:', editSeeker._id);
      const response = await updateSeekerProfile(editSeeker);
      console.log('Save seeker response:', response);
      setMessage('Seeker updated successfully');
      setSeekers(seekers.map(s => s._id === editSeeker._id ? editSeeker : s));
      setEditSeeker(null);
    } catch (error) {
      console.error('handleSaveSeeker error:', error.message, error.stack);
      setMessage('Error updating seeker: ' + error.message);
    }
  };

  const handleEditJob = (job) => {
    try {
      console.log('Editing job:', job._id);
      setEditJob({ ...job });
    } catch (error) {
      console.error('handleEditJob error:', error.message, error.stack);
      setMessage('Error preparing job edit: ' + error.message);
    }
  };

  const handleSaveJob = async () => {
    try {
      console.log('Saving job:', editJob._id);
      const payload = {
        jobId: editJob._id,
        jobTitle: editJob.jobTitle,
        skills: editJob.skills,
        skillType: editJob.skillType,
        experienceRequired: editJob.experienceRequired,
        location: editJob.location,
        maxCTC: editJob.maxCTC,
        noticePeriod: editJob.noticePeriod,
        postedBy: editJob.postedBy?._id,
      };
      const response = await updateJob(payload);
      console.log('Save job response:', response);
      setMessage('Job updated successfully');
      setJobs(jobs.map(j => j._id === editJob._id ? editJob : j));
      setEditJob(null);
    } catch (error) {
      console.error('handleSaveJob error:', error.message, error.stack);
      setMessage('Error updating job: ' + error.message);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logging out user');
      navigation.navigate('Home');
    } catch (error) {
      console.error('handleLogout error:', error.message, error.stack);
      setMessage('Error logging out: ' + error.message);
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
      <Header title="Admin Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                style={[styles.typeButton, type === 'seekers' && styles.activeTypeButton]}
                onPress={() => setType('seekers')}
              >
                <Text style={styles.buttonText}>Seekers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'jobs' && styles.activeTypeButton]}
                onPress={() => setType('jobs')}
              >
                <Text style={styles.buttonText}>Jobs</Text>
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
            >
              <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
                <Text style={styles.buttonText}>Pick Excel File</Text>
              </Animated.View>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#0000ff'} />
            ) : (
              <TouchableOpacity
                style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton, !file && styles.disabledButton]}
                onPress={handleUpload}
                onPressIn={() => handlePressIn(uploadScale)}
                onPressOut={() => handlePressOut(uploadScale)}
                disabled={!file}
              >
                <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
                  <Text style={styles.buttonText}>Upload</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
            {message && <Text style={[styles.message, isDarkMode ? styles.darkText : styles.lightText]}>{message}</Text>}

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Job Seekers</Text>
            <FlatList
              data={seekers}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                    {item.fullName || 'Unnamed Seeker'} ({item.email || 'No email'})
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={() => handleEditSeeker(item)}
                      onPressIn={() => handlePressIn(editScales[item._id]?.edit)}
                      onPressOut={() => handlePressOut(editScales[item._id]?.edit)}
                    >
                      <Animated.View style={{ transform: [{ scale: editScales[item._id]?.edit || new Animated.Value(1) }] }}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSeeker(item._id)}
                      onPressIn={() => handlePressIn(deleteScales[item._id]?.delete)}
                      onPressOut={() => handlePressOut(deleteScales[item._id]?.delete)}
                    >
                      <Animated.View style={{ transform: [{ scale: deleteScales[item._id]?.delete || new Animated.Value(1) }] }}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode ? styles.darkText : styles.lightText]}>No seekers found</Text>}
            />

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Posted Jobs</Text>
            <FlatList
              data={jobs}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                    {item.jobTitle || 'Unnamed Job'} - {item.postedBy?.companyName || user.fullName}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={() => handleEditJob(item)}
                      onPressIn={() => handlePressIn(editScales[item._id]?.edit)}
                      onPressOut={() => handlePressOut(editScales[item._id]?.edit)}
                    >
                      <Animated.View style={{ transform: [{ scale: editScales[item._id]?.edit || new Animated.Value(1) }] }}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteJob(item._id)}
                      onPressIn={() => handlePressIn(deleteScales[item._id]?.delete)}
                      onPressOut={() => handlePressOut(deleteScales[item._id]?.delete)}
                    >
                      <Animated.View style={{ transform: [{ scale: deleteScales[item._id]?.delete || new Animated.Value(1) }] }}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode ? styles.darkText : styles.lightText]}>No jobs found</Text>}
            />

            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleLogout}
              onPressIn={() => handlePressIn(logoutScale)}
              onPressOut={() => handlePressOut(logoutScale)}
            >
              <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
                <Text style={styles.buttonText}>Logout</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Edit Seeker Modal */}
            <Modal visible={!!editSeeker} transparent={true} animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                  <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Edit Seeker</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editSeeker?.fullName || ''}
                    onChangeText={(text) => setEditSeeker({ ...editSeeker, fullName: text })}
                    placeholder="Full Name"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editSeeker?.whatsappNumber || ''}
                    onChangeText={(text) => setEditSeeker({ ...editSeeker, whatsappNumber: text })}
                    placeholder="WhatsApp Number"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editSeeker?.email || ''}
                    onChangeText={(text) => setEditSeeker({ ...editSeeker, email: text })}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
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

            {/* Edit Job Modal */}
            <Modal visible={!!editJob} transparent={true} animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                  <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Edit Job</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editJob?.jobTitle || ''}
                    onChangeText={(text) => setEditJob({ ...editJob, jobTitle: text })}
                    placeholder="Job Title"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editJob?.skills?.join(', ') || ''}
                    onChangeText={(text) => setEditJob({ ...editJob, skills: text.split(', ') })}
                    placeholder="Skills (comma-separated)"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editJob?.location || ''}
                    onChangeText={(text) => setEditJob({ ...editJob, location: text })}
                    placeholder="Location"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    value={editJob?.experienceRequired?.toString() || ''}
                    onChangeText={(text) => setEditJob({ ...editJob, experienceRequired: parseInt(text) || 0 })}
                    placeholder="Experience Required (years)"
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
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
      </ScrollView>
      <Footer isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#f0f0f0' },
  darkContainer: { backgroundColor: '#111' },
  scrollContent: { padding: 10, paddingBottom: 60 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  stats: { marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  statText: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 14, marginBottom: 10 },
  uploadContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  typeButton: { padding: 10, backgroundColor: '#007AFF', borderRadius: 5 },
  activeTypeButton: { backgroundColor: '#003F87' },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  disabledButton: { backgroundColor: '#888', opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center', fontSize: 14 },
  loading: { fontSize: 16, textAlign: 'center' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 5, marginBottom: 5 },
  itemText: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { padding: 5, borderRadius: 5 },
  deleteButton: { backgroundColor: '#FF3B30' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, borderRadius: 10 },
  lightModal: { backgroundColor: '#fff' },
  darkModal: { backgroundColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  lightText: { color: '#333' },
  darkText: { color: '#ddd' },
});


//only chnage unknown provideer

