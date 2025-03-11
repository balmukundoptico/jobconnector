import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Linking, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { getProfile, searchJobs, applyToJob } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SeekerDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigation = useNavigation();
  const [applyScales, setApplyScales] = useState({});
  const [connectScales, setConnectScales] = useState({});
  const [profileScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));
  const [downloadScale] = useState(new Animated.Value(1));

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
        const fetchedUser = response.data || {};
        setUser(fetchedUser);
        setAppliedJobs(fetchedUser.appliedJobs || []);
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
      setMessage(response.message || 'Applied successfully');
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

  // **Change 1**: Fixed resume download for mobile and web, addressing "file exposed beyond app" error
  const handleDownloadResume = async () => {
    if (!user.resume) {
      setMessage('No resume available to download');
      return;
    }
    try {
      const baseUrl = 'https://jobconnector-backend.onrender.com';
      const resumeUrl = `${baseUrl}${user.resume}`;
      console.log('Downloading resume from:', resumeUrl);

      if (Platform.OS === 'web') {
        window.open(resumeUrl, '_blank');
        setMessage('Resume opened in new tab');
      } else {
        const fileUri = `${FileSystem.cacheDirectory}resume.pdf`; // Use cache directory instead of document directory
        const downloadResumable = FileSystem.createDownloadResumable(
          resumeUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            console.log('Download progress:', progress);
          }
        );
        const { uri } = await downloadResumable.downloadAsync();
        // Use FileSystem.getContentUriAsync to get a content URI for opening the file
        const contentUri = await FileSystem.getContentUriAsync(uri);
        await Linking.openURL(contentUri);
        setMessage('Resume downloaded and opened successfully');
      }
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Error downloading resume: ' + error.message);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('SeekerProfile', { user });
  };

  // **Change 2**: Changed to navigation.replace to prevent back button on logout
  // const handleLogout = () => {
  //   navigation.replace('Home');
  // };
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handlePressIn = (scale) => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = (scale) => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const formatSkills = (skills) => {
    if (Array.isArray(skills)) return skills.join(', ');
    if (typeof skills === 'string') return skills;
    return 'N/A';
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Seeker Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* **Change 3**: Moved Edit Profile and Logout buttons to the top */}
        <View style={styles.topButtons}>
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={handleEditProfile}
            onPressIn={() => handlePressIn(profileScale)}
            onPressOut={() => handlePressOut(profileScale)}
          >
            <Animated.View style={{ transform: [{ scale: profileScale }] }}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Animated.View>
          </TouchableOpacity>
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
        </View>

        <View style={styles.content}>
          {user ? (
            <>
              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Your Profile</Text>
              {/* **Change 4**: Improved dark mode visibility with darker background */}
              <View style={[styles.profileContainer, isDarkMode ? styles.darkProfileContainer : styles.lightProfileContainer]}>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Name: {user.fullName || 'N/A'}
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Email: {user.email || 'N/A'}
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  WhatsApp: {user.whatsappNumber || 'N/A'}
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Skills: {formatSkills(user.skills)}
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Experience: {user.experience || 0} years
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Location: {user.location || 'N/A'}
                </Text>
                <Text style={[styles.profileText, isDarkMode ? styles.darkText : styles.lightText]}>
                  Resume: {user.resume ? user.resume.split('/').pop() : 'Not uploaded'}
                </Text>
                {user.resume && (
                  <TouchableOpacity
                    style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                    onPress={handleDownloadResume}
                    onPressIn={() => handlePressIn(downloadScale)}
                    onPressOut={() => handlePressOut(downloadScale)}
                  >
                    <Animated.View style={{ transform: [{ scale: downloadScale }] }}>
                      <Text style={styles.buttonText}>View/Download Resume</Text>
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Job Search</Text>
              <TextInput
                style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search jobs..."
                placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
              />
              <FlatList
                data={jobs.filter(job => job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.jobItem}>
                    <Text style={[styles.jobText, isDarkMode ? styles.darkText : styles.lightText]}>
                      {item.jobTitle} - {item.postedBy?.companyName || 'Unknown Provider'}
                    </Text>
                    <View style={styles.jobActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton, item.applied && styles.disabledButton]}
                        onPress={() => handleApply(item._id)}
                        onPressIn={() => handlePressIn(applyScales[item._id]?.apply)}
                        onPressOut={() => handlePressOut(applyScales[item._id]?.apply)}
                        disabled={item.applied}
                      >
                        <Animated.View style={{ transform: [{ scale: applyScales[item._id]?.apply || new Animated.Value(1) }] }}>
                          <Text style={styles.buttonText}>{item.applied ? 'Applied' : 'Apply'}</Text>
                        </Animated.View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                        onPress={() => handleWhatsAppConnect(item.postedBy?.hrWhatsappNumber || '', item.jobTitle)}
                        onPressIn={() => handlePressIn(connectScales[item._id]?.connect)}
                        onPressOut={() => handlePressOut(connectScales[item._id]?.connect)}
                      >
                        <Animated.View style={{ transform: [{ scale: connectScales[item._id]?.connect || new Animated.Value(1) }] }}>
                          <Text style={styles.buttonText}>WhatsApp</Text>
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
              />
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
  scrollContent: { paddingBottom: 60, flexGrow: 1 },
  // **Change 5**: Added topButtons style for button placement
  topButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, marginTop: 10 },
  content: { padding: 10, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  profileContainer: { padding: 10, borderRadius: 5, marginBottom: 20 },
  lightProfileContainer: { backgroundColor: '#f0f0f0' },
  // **Change 6**: Darker background for better contrast in dark mode
  darkProfileContainer: { backgroundColor: '#333' },
  profileText: { fontSize: 16, marginBottom: 5 },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  message: { marginTop: 10, textAlign: 'center' },
  loading: { fontSize: 16, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
});

//working code