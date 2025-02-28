// O:\JobConnector\mobileapp\pages\ProviderDashboard.js
import React, { useState, useEffect } from 'react'; // React core
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Modal, Linking } from 'react-native'; // RN components
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import { getProfile, postJob, searchJobs, updateProviderProfile, sendMassEmail, searchSeekers, saveSearch, getApplicants } from '../utils/api'; // API functions
import Header from '../components/Header'; // Reusable header
import Footer from '../components/Footer'; // Reusable footer

// ProviderDashboard component with WhatsApp default message
export default function ProviderDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null); // User from navigation state
  const [jobTitle, setJobTitle] = useState(''); // Job title input
  const [jobDescription, setJobDescription] = useState(''); // Job description input
  const [skillType, setSkillType] = useState('IT'); // Skill type
  const [skills, setSkills] = useState(''); // Skills input
  const [experienceRequired, setExperienceRequired] = useState(''); // Experience input
  const [location, setLocation] = useState(''); // Location input
  const [maxCTC, setMaxCTC] = useState(''); // Max CTC input
  const [noticePeriod, setNoticePeriod] = useState(''); // Notice period input
  const [whatsappNumber, setWhatsappNumber] = useState(''); // WhatsApp input
  const [emailSubject, setEmailSubject] = useState(''); // Email subject input
  const [emailBody, setEmailBody] = useState(''); // Email body input
  const [seekerQuery, setSeekerQuery] = useState(''); // Seeker search input
  const [seekers, setSeekers] = useState([]); // Searched seekers list
  const [selectedSeekers, setSelectedSeekers] = useState([]); // Selected seekers for email
  const [message, setMessage] = useState(''); // Message display
  const [postedJobs, setPostedJobs] = useState([]); // Posted jobs
  const [applicants, setApplicants] = useState([]); // Applicants list
  const [selectedJobId, setSelectedJobId] = useState(null); // Job ID for modal
  const navigation = useNavigation(); // Navigation instance
  const [postScale] = useState(new Animated.Value(1)); // Animation scales
  const [whatsappScale] = useState(new Animated.Value(1));
  const [emailScale] = useState(new Animated.Value(1));
  const [searchScale] = useState(new Animated.Value(1));
  const [profileScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));
  const [connectScales, setConnectScales] = useState({});

  // Fetch data on mount
  useEffect(() => {
    if (!route?.params?.contact) {
      navigation.navigate('AuthForm', { role: 'provider' }); // Redirect if no contact
      return;
    }
    fetchData(); // Load initial data
  }, [route, navigation]);

  // Fetch provider data
  const fetchData = async () => {
    try {
      if (!user) { // Fetch profile if not provided
        const isEmail = route.params.contact.includes('@');
        const response = await getProfile({
          role: 'provider',
          ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
        });
        setUser(response.data); // Set provider user
      }
      const jobsResponse = await searchJobs({}); // Fetch jobs from live backend
      const userJobs = jobsResponse.data.filter(job => job.postedBy?._id === user?._id);
      setPostedJobs(userJobs); // Update posted jobs
      const applicantsResponse = await getApplicants(user?._id); // Fetch applicants from live backend
      setApplicants(applicantsResponse.data); // Update applicants
      const scales = {};
      applicantsResponse.data.forEach(applicant => { scales[applicant._id] = new Animated.Value(1); });
      setConnectScales(scales);
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
    }
  };

  // Handle job posting
  const handlePostJob = async () => {
    const jobData = { 
      jobTitle, 
      skillType, 
      skills, // Keep as string since backend splits it
      experienceRequired, 
      location, 
      maxCTC, 
      noticePeriod, 
      postedBy: user?._id 
    };
    try {
      const response = await postJob(jobData); // Live backend call
      setMessage(response.data.message); // Show success
      setJobTitle(''); setJobDescription(''); setSkills(''); setExperienceRequired(''); setLocation(''); setMaxCTC(''); setNoticePeriod(''); // Reset fields
      fetchData(); // Refresh jobs
    } catch (error) {
      setMessage('Error posting job: ' + error.message);
    }
  };

  // Handle sending WhatsApp message
  const handleSendWhatsApp = async () => {
    try {
      const response = await sendWhatsAppMessage({ number: whatsappNumber, message: 'New job posted!' }); // Live backend call
      setMessage(response.data.message); // Show success
      setWhatsappNumber(''); // Reset field
    } catch (error) {
      setMessage('Error sending WhatsApp: ' + error.message);
    }
  };

  // Handle sending mass email
  const handleSendMassEmail = async () => {
    if (selectedSeekers.length === 0) {
      setMessage('Please select at least one seeker');
      return;
    }
    try {
      const response = await sendMassEmail({ seekerIds: selectedSeekers, subject: emailSubject, body: emailBody }); // Live backend call
      setMessage('Mass emails sent successfully'); // Show success
      setEmailSubject(''); setEmailBody(''); setSelectedSeekers([]); // Reset fields
    } catch (error) {
      setMessage('Error sending mass email: ' + error.message);
    }
  };

  // Handle searching seekers
  const handleSearchSeekers = async () => {
    try {
      const response = await searchSeekers({ skills: seekerQuery }); // Live backend call with basic filter
      setSeekers(response.data); // Update seekers list
      const scales = {};
      response.data.forEach(seeker => { scales[seeker._id] = new Animated.Value(1); });
      setConnectScales(scales);
    } catch (error) {
      setMessage('Error searching seekers: ' + error.message);
    }
  };

  // Handle seeker selection for email
  const handleSeekerSelect = (seekerId) => {
    setSelectedSeekers(prev => prev.includes(seekerId) ? prev.filter(id => id !== seekerId) : [...prev, seekerId]);
  };

  // Handle viewing applicants
  const handleViewApplicants = (jobId) => {
    setSelectedJobId(jobId); // Show modal
  };

  // Handle WhatsApp connect with default message
  const handleWhatsAppConnect = (number, seekerName) => {
    const defaultMessage = `Hi ${seekerName}, I'm interested in discussing job opportunities with you`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=${number.replace(/\D/g, '')}&text=${encodeURIComponent(defaultMessage)}`); // Open WhatsApp with message
    setMessage(`Connected with ${seekerName} via WhatsApp`);
  };

  // Handle resume download
  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      Linking.openURL(resumeUrl); // Open resume URL from backend
    } else {
      setMessage('No resume available');
    }
  };

  // Navigate to profile edit
  const handleEditProfile = () => {
    navigation.navigate('ProviderProfile', { user }); // Pass user data for editing
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
      <Header title="Provider Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.content}>
        {user ? (
          <>
            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Post a New Job</Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Job Title"
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Skills (comma-separated)"
              value={skills}
              onChangeText={setSkills}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Experience Required (years)"
              value={experienceRequired}
              onChangeText={setExperienceRequired}
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Max CTC"
              value={maxCTC}
              onChangeText={setMaxCTC}
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Notice Period"
              value={noticePeriod}
              onChangeText={setNoticePeriod}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handlePostJob}
              onPressIn={() => handlePressIn(postScale)}
              onPressOut={() => handlePressOut(postScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: postScale }] }]}>
                <Text style={styles.buttonText}>Post Job</Text>
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Notify via WhatsApp</Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="WhatsApp Number"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleSendWhatsApp}
              onPressIn={() => handlePressIn(whatsappScale)}
              onPressOut={() => handlePressOut(whatsappScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: whatsappScale }] }]}>
                <Text style={styles.buttonText}>Send WhatsApp</Text>
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Send Mass Email</Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Email Subject"
              value={emailSubject}
              onChangeText={setEmailSubject}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Email Body"
              value={emailBody}
              onChangeText={setEmailBody}
              multiline
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>Select Seekers:</Text>
            <FlatList
              data={seekers}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                    {item.fullName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleSeekerSelect(item._id)}
                    style={[styles.checkbox, selectedSeekers.includes(item._id) && styles.checked]}
                  >
                    <Text style={styles.checkboxText}>{selectedSeekers.includes(item._id) ? '✔' : ''}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleSendMassEmail}
              onPressIn={() => handlePressIn(emailScale)}
              onPressOut={() => handlePressOut(emailScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: emailScale }] }]}>
                <Text style={styles.buttonText}>Send Email</Text>
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Search Job Seekers</Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Search by Skills"
              value={seekerQuery}
              onChangeText={setSeekerQuery}
              placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
            />
            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleSearchSeekers}
              onPressIn={() => handlePressIn(searchScale)}
              onPressOut={() => handlePressOut(searchScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: searchScale }] }]}>
                <Text style={styles.buttonText}>Search Seekers</Text>
              </Animated.View>
            </TouchableOpacity>
            <FlatList
              data={seekers}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                    {item.fullName} - {item.skills?.join(', ') || 'N/A'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                    onPress={() => handleWhatsAppConnect(item.whatsappNumber, item.fullName)}
                    onPressIn={() => handlePressIn(connectScales[item._id])}
                    onPressOut={() => handlePressOut(connectScales[item._id])}
                    activeOpacity={0.8}
                  >
                    <Animated.View style={[styles.buttonInner, { transform: [{ scale: connectScales[item._id] || new Animated.Value(1) }] }]}>
                      <Text style={styles.buttonText}>WhatsApp</Text>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Your Posted Jobs</Text>
            <FlatList
              data={postedJobs}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.jobItem}>
                  <Text style={[styles.jobText, isDarkMode ? styles.darkText : styles.lightText]}>
                    {item.jobTitle}
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                    onPress={() => handleViewApplicants(item._id)}
                  >
                    <Text style={styles.buttonText}>View Applicants</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Modal
              visible={!!selectedJobId}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setSelectedJobId(null)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                  <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                    Applicants for Job {selectedJobId}
                  </Text>
                  <FlatList
                    data={applicants.filter(applicant => applicant.jobId === selectedJobId)}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                          {item.seeker.fullName} - {item.seeker.email || 'N/A'}
                        </Text>
                        <TouchableOpacity
                          style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                          onPress={() => handleDownloadResume(item.seeker.resume)}
                        >
                          <Text style={styles.buttonText}>Download Resume</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  <TouchableOpacity
                    style={[styles.closeButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                    onPress={() => setSelectedJobId(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
              onPress={handleEditProfile}
              onPressIn={() => handlePressIn(profileScale)}
              onPressOut={() => handlePressOut(profileScale)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonInner, { transform: [{ scale: profileScale }] }]}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </Animated.View>
            </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  itemText: { fontSize: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#007AFF' },
  checkboxText: { color: '#fff' },
  jobItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  jobText: { fontSize: 16 },
  actionButton: { padding: 5, borderRadius: 5 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonInner: { padding: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: 20, borderRadius: 10 },
  lightModal: { backgroundColor: '#fff' },
  darkModal: { backgroundColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { marginTop: 10, padding: 10, borderRadius: 5, alignItems: 'center' },
  message: { marginTop: 10, textAlign: 'center' },
  loading: { fontSize: 16, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' }
});
