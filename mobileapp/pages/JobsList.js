import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Linking, ScrollView, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { searchJobs } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ReanimatedView = Reanimated.createAnimatedComponent(View);

const JobCard = ({ item, isDarkMode, isSelected, onSelect, handleApply, handleWhatsApp, appliedJobs, whatsappedJobs }) => {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const glowAnim = useRef(new Animated.Value(0)).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
      { translateY: withSpring(isSelected ? -10 : 0) },
    ],
  }));

  const onGestureEvent = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    tiltX.value = Math.min(Math.max(translationX / 10, -15), 15);
    tiltY.value = Math.min(Math.max(-translationY / 10, -15), 15);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) {
      tiltX.value = withSpring(0);
      tiltY.value = withSpring(0);
      onSelect(item._id);
    }
  };

  const triggerGlow = () => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const glowStyle = {
    borderWidth: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isSelected ? 2 : 0, 4],
    }),
    borderColor: isDarkMode ? '#00ffcc' : '#007AFF',
  };

  const isApplied = appliedJobs.has(item._id);
  const isWhatsapped = whatsappedJobs.has(item._id);

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <ReanimatedView
        style={[
          styles.jobCard,
          isDarkMode ? styles.darkJobCard : styles.lightJobCard,
          isSelected && (isDarkMode ? styles.darkSelectedCard : styles.lightSelectedCard),
          animatedStyle,
          glowStyle,
        ]}
      >
        <Text style={[styles.jobTitle, isDarkMode ? styles.darkText : styles.lightText]}>
          {item.jobTitle}
        </Text>
        <Text style={[styles.jobDetails, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
          Company: {item.postedBy?.companyName || 'N/A'}
        </Text>
        <Text style={[styles.jobDetails, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
          Skills: {item.skills?.join(', ') || 'N/A'}
        </Text>
        <Text style={[styles.jobDetails, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
          Location: {item.location || 'N/A'}
        </Text>
        <Text style={[styles.jobDetails, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
          Max CTC: {item.maxCTC || 'N/A'}
        </Text>
        <Text style={[styles.jobDetails, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
          Notice Period: {item.noticePeriod || 'N/A'}
        </Text>
        <View style={styles.jobActions}>
          <TouchableOpacity
            onPress={() => {
              handleApply(item._id);
              triggerGlow();
            }}
            style={[
              styles.actionButton,
              isDarkMode ? styles.darkApplyButton : styles.lightApplyButton,
              isApplied && (isDarkMode ? styles.darkAppliedButton : styles.lightAppliedButton),
            ]}
          >
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
          {item.postedBy?.hrWhatsappNumber && (
            <TouchableOpacity
              onPress={() => {
                handleWhatsApp(item.postedBy.hrWhatsappNumber, item.postedBy.companyName, item._id);
                triggerGlow();
              }}
              style={[
                styles.actionButton,
                isDarkMode ? styles.darkWhatsAppButton : styles.lightWhatsAppButton,
                isWhatsapped && (isDarkMode ? styles.darkWhatsappedButton : styles.lightWhatsappedButton),
              ]}
            >
              <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </ReanimatedView>
    </PanGestureHandler>
  );
};

export default function JobsList({ isDarkMode, toggleDarkMode, route }) {
  const [jobs, setJobs] = useState([]);
  const [searchSkills, setSearchSkills] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [whatsappedJobs, setWhatsappedJobs] = useState(new Set());
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const user = route?.params?.user || null;
    // const token = localStorage.getItem('token');
    setIsAuthenticated(!!user || '');
    fetchJobs();
  }, [route]);

  useEffect(() => {
    if (jobs.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [jobs]);

  const fetchJobs = async (filters = {}) => {
    try {
      const searchFilters = { ...filters, available: true }; // Explicitly request active jobs
      const response = await searchJobs(searchFilters);
      const fetchedJobs = (response.data || []).filter(job => job.available === true); // Client-side filter
      console.log('Fetched Jobs in JobsList:', fetchedJobs); // Debug log
      setJobs(fetchedJobs);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch jobs: ' + error.message);
      console.error('fetchJobs error:', error);
      setJobs([]);
    }
  };

  const handleSearch = async () => {
    try {
      const searchData = {
        skills: searchSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        location: searchLocation.trim(),
        available: true, // Explicitly request active jobs
      };
      const response = await searchJobs(searchData);
      const fetchedJobs = (response.data || []).filter(job => job.available === true); // Client-side filter
      console.log('Searched Jobs in JobsList:', fetchedJobs); // Debug log
      setJobs(fetchedJobs);
      setSelectedJobId(null);
    } catch (error) {
      console.error('Search Error:', error.response?.data || error);
      Alert.alert('Error', 'Error searching jobs: ' + (error.response?.data?.message || error.message));
      setJobs([]);
    }
  };

  const handleApply = (jobId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      Alert.alert('Success', `Applied to job ${jobId}`);
      setAppliedJobs(prev => new Set(prev).add(jobId));
    }
  };

  const handleWhatsApp = (whatsappNumber, companyName, jobId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      const message = `Hi ${companyName}, I'm interested in your job posting!`;
      Linking.openURL(`https://api.whatsapp.com/send?phone=${whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`);
      Alert.alert('Success', `Connected via WhatsApp to ${companyName}`);
      setWhatsappedJobs(prev => new Set(prev).add(jobId));
    }
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigation.navigate('Home');
  };

  const handleRegisterRedirect = () => {
    setShowAuthModal(false);
    navigation.navigate('Register');
  };

  const renderJobItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <JobCard
        item={item}
        isDarkMode={isDarkMode}
        isSelected={selectedJobId === item._id}
        onSelect={setSelectedJobId}
        handleApply={handleApply}
        handleWhatsApp={handleWhatsApp}
        appliedJobs={appliedJobs}
        whatsappedJobs={whatsappedJobs}
      />
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
        <Header title="Job Listings" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.authButtonsContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={[styles.authButton, isDarkMode ? styles.darkAuthButton : styles.lightAuthButton]}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={[styles.authButton, isDarkMode ? styles.darkAuthButton : styles.lightAuthButton]}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              Search Jobs
            </Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Search by Skills (e.g., Floor, Manager)"
              value={searchSkills}
              onChangeText={setSearchSkills}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Search by Location (e.g., Mumbai)"
              value={searchLocation}
              onChangeText={setSearchLocation}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TouchableOpacity
              onPress={handleSearch}
              style={[styles.searchButton, isDarkMode ? styles.darkSearchButton : styles.lightSearchButton]}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
              All Jobs
            </Text>
            <FlatList
              data={jobs}
              keyExtractor={(item) => item._id.toString()}
              renderItem={renderJobItem}
              ListEmptyComponent={
                <Text style={[styles.emptyText, isDarkMode ? styles.darkText : styles.lightText]}>
                  No jobs found.
                </Text>
              }
              scrollEnabled={false}
              contentContainerStyle={styles.jobList}
            />

            <Modal
              visible={showAuthModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowAuthModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                  <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                    Please Log In or Register
                  </Text>
                  <Text style={[styles.modalText, isDarkMode ? styles.darkSubText : styles.lightSubText]}>
                    You need to log in or create a profile to apply for jobs or contact providers.
                  </Text>
                  <TouchableOpacity
                    onPress={handleLoginRedirect}
                    style={[styles.modalButton, isDarkMode ? styles.darkAuthButton : styles.lightAuthButton]}
                  >
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRegisterRedirect}
                    style={[styles.modalButton, isDarkMode ? styles.darkAuthButton : styles.lightAuthButton]}
                  >
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowAuthModal(false)}
                    style={[styles.closeButton, isDarkMode ? styles.darkCloseButton : styles.lightCloseButton]}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
        <Footer isDarkMode={isDarkMode} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#f5f5f5' },
  darkContainer: { backgroundColor: '#1a1a1a' },
  scrollContent: { paddingBottom: 60, flexGrow: 1 },
  content: { padding: 15 },
  authButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  authButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginHorizontal: 5,
    elevation: 3,
  },
  lightAuthButton: { backgroundColor: '#007AFF' },
  darkAuthButton: { backgroundColor: '#00cc99' },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginVertical: 15,
    textAlign: 'center',
  },
  lightText: { color: '#333' },
  darkText: { color: '#fff' },
  input: { 
    borderWidth: 1, 
    padding: 12, 
    marginBottom: 15, 
    borderRadius: 12, 
    fontSize: 16,
    backgroundColor: '#fff',
  },
  lightInput: { 
    borderColor: '#ddd', 
    color: '#333',
    backgroundColor: '#fff',
    elevation: 2,
  },
  darkInput: { 
    borderColor: '#444', 
    color: '#fff', 
    backgroundColor: '#2a2a2a',
    elevation: 2,
  },
  searchButton: { 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 3,
  },
  lightSearchButton: { backgroundColor: '#007AFF' },
  darkSearchButton: { backgroundColor: '#ff3366' },
  jobList: { 
    paddingBottom: 20, 
    paddingTop: 10,
  },
  jobCard: { 
    padding: 20, 
    marginVertical: 12,
    marginHorizontal: 10,
    borderRadius: 15, 
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lightJobCard: { backgroundColor: '#fff' },
  darkJobCard: { backgroundColor: '#2a2a2a' },
  lightSelectedCard: { 
    backgroundColor: '#e6f0ff', 
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  darkSelectedCard: { 
    backgroundColor: '#3a3a3a', 
    borderColor: '#00cc99',
    borderWidth: 2,
  },
  jobTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  jobDetails: { 
    fontSize: 14, 
    marginVertical: 3 
  },
  lightSubText: { color: '#666' },
  darkSubText: { color: '#bbb' },
  jobActions: { 
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 15 
  },
  actionButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    elevation: 2,
  },
  lightApplyButton: { backgroundColor: '#28a745' },
  darkApplyButton: { backgroundColor: '#00cc99' },
  lightAppliedButton: { backgroundColor: '#d4edda' },
  darkAppliedButton: { backgroundColor: '#66ffcc' },
  lightWhatsAppButton: { backgroundColor: '#6f42c1' },
  darkWhatsAppButton: { backgroundColor: '#9933ff' },
  lightWhatsappedButton: { backgroundColor: '#e2d6f5' },
  darkWhatsappedButton: { backgroundColor: '#cc99ff' },
  buttonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  emptyText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 20 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)' 
  },
  modalContent: { 
    width: '85%', 
    padding: 25, 
    borderRadius: 20, 
    elevation: 5 
  },
  lightModal: { backgroundColor: '#fff' },
  darkModal: { backgroundColor: '#2a2a2a' },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: { 
    fontSize: 16, 
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: { 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginVertical: 5,
    elevation: 2,
  },
  closeButton: { 
    marginTop: 15, 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  lightCloseButton: { backgroundColor: '#dc3545' },
  darkCloseButton: { backgroundColor: '#ff3366' },
});