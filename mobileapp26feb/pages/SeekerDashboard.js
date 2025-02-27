// mobileapp/pages/SeekerDashboard.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SeekerDashboard = ({ route, isDarkMode, toggleDarkMode }) => {
  const { user, contact } = route.params || {};
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const [searchScale] = useState(new Animated.Value(1));

  const handleSearch = async () => {
    try {
      const response = await api.get('/jobs/search', { params: { skills: search } });
      setJobs(response.data);
      setMessage('Search completed');
    } catch (error) {
      setMessage('Error searching jobs');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await api.post('/jobs/apply', { seekerId: user._id, jobId });
      setMessage('Applied successfully');
    } catch (error) {
      setMessage('Error applying to job');
    }
  };

  const renderJob = ({ item }) => (
    <View style={[styles.jobItem, isDarkMode ? styles.darkJobItem : styles.lightJobItem]}>
      <Text style={isDarkMode ? styles.darkText : styles.lightText}>{item.jobTitle} - {item.postedBy.companyName}</Text>
      <TouchableOpacity
        style={[styles.applyButton, isDarkMode ? styles.darkButton : styles.lightButton]}
        onPress={() => handleApply(item._id)}
      >
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  const handlePressIn = (scale) => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Seeker Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
          Welcome, {user?.fullName || 'User'}
        </Text>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs by skills"
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
        />
        <TouchableOpacity
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={handleSearch}
          onPressIn={() => handlePressIn(searchScale)}
          onPressOut={() => handlePressOut(searchScale)}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: searchScale }] }]}>
            <Text style={styles.buttonText}>Search</Text>
          </Animated.View>
        </TouchableOpacity>
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={item => item._id}
          style={styles.jobList}
        />
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
  content: { flex: 1, padding: 16 },
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
  jobList: { marginTop: 10 },
  jobItem: { padding: 10, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lightJobItem: { borderBottomColor: '#ccc' },
  darkJobItem: { borderBottomColor: '#555' },
  applyButton: { borderRadius: 15, padding: 10 },
  applyButtonText: { color: '#fff', fontSize: 16 },
  message: { marginTop: 10, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
});

export default SeekerDashboard;