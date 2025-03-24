import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Animated, Modal, Linking, ScrollView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { getProfile, postJob, searchJobs, updateProviderProfile, sendMassEmail, searchSeekers, saveSearch, getApplicants, updateJob, deleteJob, changeJobAvailibility } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProviderDashboard({ isDarkMode, toggleDarkMode, route }) {
  const [user, setUser] = useState(route?.params?.user || null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skillType, setSkillType] = useState('IT');
  const [skills, setSkills] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [showSeekerProfileModal, setShowSeekerProfileModal] = useState(false);
  const [location, setLocation] = useState('');
  const [maxCTC, setMaxCTC] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [seekerQuery, setSeekerQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [selectedSeekers, setSelectedSeekers] = useState([]);
  const [message, setMessage] = useState('');
  const [postedJobs, setPostedJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedSeekerId, setSelectedSeekerId] = useState(null);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState(null);
  const navigation = useNavigation();
  const [postScale] = useState(new Animated.Value(1));
  const [whatsappScale] = useState(new Animated.Value(1));
  const [emailScale] = useState(new Animated.Value(1));
  const [searchScale] = useState(new Animated.Value(1));
  const [profileScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));
  const [connectScales, setConnectScales] = useState({});
  const [downloadScale] = useState(new Animated.Value(1));
  const [editJobScale] = useState(new Animated.Value(1));
  const [deleteJobScale] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!route?.params?.contact && !user) {
      navigation.navigate('AuthForm', { role: 'provider' });
      return;
    }
    fetchData();
  }, [route, navigation]);

  useEffect(() => {
    console.log("Updated Jobs Array:", postedJobs);
  }, [postedJobs]); 
   
  
  const fetchData = async () => {
    try {
      if (!user) {
        const isEmail = route.params.contact.includes('@');
        const response = await getProfile({
          role: 'provider',
          ...(isEmail ? { email: route.params.contact } : { whatsappNumber: route.params.contact }),
        });
        setUser(response.data);
      }
      const jobsResponse = await searchJobs({});
      const userJobs = jobsResponse.data.filter(job => job.postedBy?._id === user?._id && job.postedBy);
      for(job of userJobs){
        console.log("job id : ", job);
      }
      console.log("jobs posted by you", userJobs);
      setPostedJobs((prevJobs) => [...prevJobs, ...userJobs]);
      const applicantsResponse = await getApplicants(user?._id);
      setApplicants(applicantsResponse.data);
      const scales = {};
      applicantsResponse.data.forEach(applicant => { scales[applicant._id] = new Animated.Value(1); });
      setConnectScales(scales);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data: ' + error.message);
    }
  };

  const handlePostJob = async () => {
    const jobData = {
      jobTitle,
      jobDescription,
      skillType,
      skills: skills.split(",").map((s) => s.trim()),
      experienceRequired: parseInt(experienceRequired) || 0,
      location,
      maxCTC: parseInt(maxCTC) || 0,
      noticePeriod,
      postedBy: { _id: user?._id },
    };
  
    console.log("Job Data:", jobData); // Log the data being sent
  
    try {
      const response = await postJob(jobData);
      Alert.alert("Success", "Job posted successfully");
      console.log("created job", response.data.job);
  
      const newJob = response.data.job;
      if (!newJob) {
        console.log("No new job data received");
        return;
      }
  
      // ✅ Set state first before calling fetchData()
      setPostedJobs((prevJobs) => [...prevJobs, newJob]);
  
      // ✅ Delay fetchData() slightly to allow state update
      setTimeout(fetchData, 500);
  
      console.log("now posted job array is", postedJobs); // ❌ This will still log the old state
  
      // Reset form fields
      setJobTitle("");
      setJobDescription("");
      setSkills("");
      setExperienceRequired("");
      setLocation("");
      setMaxCTC("");
      setNoticePeriod("");
  
    } catch (error) {
      Alert.alert("Error", "Failed to post job: " + error.message);
      console.error("❌ Error posting job:", error);
    }
  };
  

  const handleUpdateJob = async () => {
    if (!selectedJobForEdit) {
      Alert.alert('Error', 'No job selected for editing.');
      return;
    }
  
    const jobData = {
      jobTitle,
      jobDescription,
      skillType,
      skills: skills.split(',').map(s => s.trim()), // Convert skills string to array
      experienceRequired: parseInt(experienceRequired) || 0,
      location,
      maxCTC: parseInt(maxCTC) || 0,
      noticePeriod,
      postedBy: user?._id,
      _id: selectedJobForEdit._id, // Include the job ID for updating
    };
  
    try {
      const response = await updateJob(jobData); // Call the API to update the job
      Alert.alert('Success', 'Job updated successfully');
      console.log('Job updated successfully:', response);
  
      // Reset form fields and close the modal
      setJobTitle('');
      setJobDescription('');
      setSkills('');
      setExperienceRequired('');
      setLocation('');
      setMaxCTC('');
      setNoticePeriod('');
      setSelectedJobForEdit(null);
  
      // Refresh the job list
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update job: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob({ jobId });
      Alert.alert('Success', 'Job deleted successfully');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete job: ' + error.message);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const defaultMessage = 'New job posted!';
      Linking.openURL(`https://api.whatsapp.com/send?phone=${whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(defaultMessage)}`);
      Alert.alert('Success', 'WhatsApp message sent');
      setWhatsappNumber('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send WhatsApp: ' + error.message);
    }
  };

  const handleSendMassEmail = async () => {
    if (selectedSeekers.length === 0) {
      Alert.alert('Error', 'Please select at least one seeker');
      return;
    }
    try {
      await sendMassEmail({ seekerIds: selectedSeekers, subject: emailSubject, body: emailBody });
      Alert.alert('Success', 'Mass emails sent successfully');
      setEmailSubject(''); setEmailBody(''); setSelectedSeekers([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send mass email: ' + error.message);
    }
  };

  const handleSearchSeekers = async () => {
    try {
      const response = await searchSeekers({ skills: seekerQuery, location: locationQuery });
      if(!response || !response.data) console.log("unable to set seekers");
      console.log("setting seeker's with data", response.data);
      setSeekers(response.data);
      const scales = {};
      response.data.forEach(seeker => { scales[seeker._id] = new Animated.Value(1); });
      setConnectScales(scales);
    } catch (error) {
      Alert.alert('Error', 'Failed to search seekers: ' + error.message);
    }
  };

  const handleSeekerSelect = (seekerId) => {
    setSelectedSeekers(prev => prev.includes(seekerId) ? prev.filter(id => id !== seekerId) : [...prev, seekerId]);
  };

  const handleViewApplicants = async (jobId) => {
    try {
      const providerId = user?._id;
      const response = await getApplicants(providerId, jobId);
      console.log("getapplicatns response", response);
      setApplicants(response.data);
      setSelectedJobId(jobId);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch applicants: ' + error.message);
    }
  };

  const handleViewSeekerProfile = (seekerId) => {
    // if seeker if not present then don't show
    if (!seekerId) {
      Alert.alert('Error', 'No seeker selected.');
      return;
    }
    setSelectedJobId(null); // Close the Applicants modal
    setSelectedSeekerId(seekerId); // Set the selected seeker ID
    setShowSeekerProfileModal(true); // Show the SeekerProfileDetails modal
  };

  const handleEditJob = (job) => {
    setSelectedJobForEdit(job); 
    setJobTitle(job.jobTitle || '');
    setJobDescription(job.jobDescription || '');
    setSkillType(job.skillType || 'IT');
    setSkills((job.skills || []).join(', ')); 
    setExperienceRequired(job.experienceRequired?.toString() || '');
    setLocation(job.location || '');
    setMaxCTC(job.maxCTC?.toString() || '');
    setNoticePeriod(job.noticePeriod || '');
  };

  const handleCloseSeekerProfileModal = () => {
    setShowSeekerProfileModal(false);
    setSelectedSeekerId(null); // Reset the selected seeker ID
  };

  const handleWhatsAppConnect = (number, seekerName) => {
    const defaultMessage = `Hi ${seekerName}, I'm interested in discussing job opportunities with you`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=${number.replace(/\D/g, '')}&text=${encodeURIComponent(defaultMessage)}`);
    Alert.alert('Success', `Connected with ${seekerName} via WhatsApp`);
  };

  const handleDownloadResume = async (resumePath) => {
    if (!resumePath) {
      Alert.alert('Error', 'No resume available');
      return;
    }
    try {
      const baseUrl = Platform.OS === 'web' ? 'https://jobconnector-backend.onrender.com' : 'https://jobconnector-backend.onrender.com';
      const resumeUrl = `${baseUrl}${resumePath}`;
      if (Platform.OS === 'web') {
        window.open(resumeUrl, '_blank');
        Alert.alert('Success', 'Resume opened in new tab');
      } else {
        const fileUri = `${FileSystem.documentDirectory}resume${resumePath.endsWith('.pdf') ? '.pdf' : '.docx'}`;
        const { uri } = await FileSystem.downloadAsync(resumeUrl, fileUri);
        await Linking.openURL(uri);
        Alert.alert('Success', 'Resume downloaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download resume: ' + error.message);
    }
  };

  const handleActiveInactiveJob = async (job) => {
    console.log("this job has to be marked inactive", job);
    const jobId = job._id;
    try{
      console.log(jobId);
      const response = await changeJobAvailibility(job._id);
      setPostedJobs(prevJobs => 
        prevJobs.map(job => 
            job._id === jobId ? { ...job, available: newAvailability } : job
        )
    );
    console.log("activeness changed of", response);
      console.log("job availibility response", response);
    } catch(err){
      console.log("error while changing availibility", err);
    }
  }

  const handleEditProfile = () => {
    navigation.navigate('ProviderProfile', { user });
  };

  const handleLogout = () => {
    navigation.navigate('Home');
  };

  const handlePressIn = (scale) => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = (scale) => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const renderSeekerProfile = (seeker) => {
    //checking for null berfore rendering
    if (!seeker) {
      return (
        <View>
          <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
            No seeker data available.
          </Text>
        </View>
      );
    }
  
    return (
      <View>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Name: {seeker.fullName}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Email: {seeker.email || 'N/A'}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>WhatsApp: {seeker.whatsappNumber || 'N/A'}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Skills: {seeker.skills?.join(', ') || 'N/A'}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Experience: {seeker.experience || 0} years</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Location: {seeker.location || 'N/A'}</Text>
        <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>Resume: {seeker.resume ? seeker.resume.split('/').pop() : 'Not uploaded'}</Text>
        {seeker.resume && (
          <TouchableOpacity
            style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => handleDownloadResume(seeker.resume)}
            onPressIn={() => handlePressIn(downloadScale)}
            onPressOut={() => handlePressOut(downloadScale)}
          >
            <Animated.View style={{ transform: [{ scale: downloadScale }] }}>
              <Text style={styles.buttonText}>View/Download Resume</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
          onPress={() => handleWhatsAppConnect(seeker.whatsappNumber, seeker.fullName)}
          onPressIn={() => handlePressIn(connectScales[seeker._id])}
          onPressOut={() => handlePressOut(connectScales[seeker._id])}
        >
          <Animated.View style={{ transform: [{ scale: connectScales[seeker._id] || new Animated.Value(1) }] }}>
            <Text style={styles.buttonText}>WhatsApp</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderJobDetails = (job, jobData) => (
    <View>
      <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Job Title" value={jobTitle || ''} onChangeText={setJobTitle} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
          placeholder="Job Description" 
          value={jobDescription || ''} 
          onChangeText={setJobDescription} multiline 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
          placeholder="Skills (comma-separated)" 
          value={skills} onChangeText={setSkills || ''} 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Experience Required (years)" 
          value={experienceRequired} 
          onChangeText={setExperienceRequired || ''} 
          keyboardType="numeric" 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
          placeholder="Location" 
          value={location} 
          onChangeText={setLocation || ''} 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
          placeholder="Max CTC" value={maxCTC} 
          onChangeText={setMaxCTC || ''} 
          keyboardType="numeric" 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

        <TextInput 
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
          placeholder="Notice Period" 
          value={noticePeriod} 
          onChangeText={setNoticePeriod || ''} 
          placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />

    </View>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Header title="Provider Dashboard" toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <View style={styles.topActions}>
        <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleEditProfile} onPressIn={() => handlePressIn(profileScale)} onPressOut={() => handlePressOut(profileScale)} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale: profileScale }] }}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleLogout} onPressIn={() => handlePressIn(logoutScale)} onPressOut={() => handlePressOut(logoutScale)} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
            <Text style={styles.buttonText}>Logout</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {user ? (
            <>
              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
                {selectedJobForEdit ? 'Edit Job' : 'Post a New Job'}
              </Text>
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Job Title" value={jobTitle || ''} onChangeText={setJobTitle} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Skills (comma-separated)" value={skills || ''} onChangeText={setSkills} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Experience Required (years)" value={experienceRequired || ''} onChangeText={setExperienceRequired} keyboardType="numeric" placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Location" value={location || ''} onChangeText={setLocation} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Max CTC" value={maxCTC || ''} onChangeText={setMaxCTC} keyboardType="numeric" placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Notice Period" value={noticePeriod || ''} onChangeText={setNoticePeriod} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={selectedJobForEdit ? handleUpdateJob : handlePostJob} onPressIn={() => handlePressIn(postScale)} onPressOut={() => handlePressOut(postScale)} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: postScale }] }}>
                  <Text style={styles.buttonText}>{selectedJobForEdit ? 'Update Job' : 'Post Job'}</Text>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Notify via WhatsApp</Text>
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="WhatsApp Number" value={whatsappNumber} onChangeText={setWhatsappNumber} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleSendWhatsApp} onPressIn={() => handlePressIn(whatsappScale)} onPressOut={() => handlePressOut(whatsappScale)} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: whatsappScale }] }}>
                  <Text style={styles.buttonText}>Send WhatsApp</Text>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Send Mass Email</Text>
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Email Subject" value={emailSubject} onChangeText={setEmailSubject} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Email Body" value={emailBody} onChangeText={setEmailBody} multiline placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>Select Seekers:</Text>
              <FlatList
                data={seekers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>{item.fullName}</Text>
                    <TouchableOpacity onPress={() => handleSeekerSelect(item._id)} style={[styles.checkbox, selectedSeekers.includes(item._id) && styles.checked]}>
                      <Text style={styles.checkboxText}>{selectedSeekers.includes(item._id) ? '✔' : ''}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleSendMassEmail} onPressIn={() => handlePressIn(emailScale)} onPressOut={() => handlePressOut(emailScale)} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: emailScale }] }}>
                  <Text style={styles.buttonText}>Send Email</Text>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Search Job Seekers</Text>
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Search by Skills" value={seekerQuery} onChangeText={setSeekerQuery} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TextInput style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholder="Search by Location" value={locationQuery} onChangeText={setLocationQuery} placeholderTextColor={isDarkMode ? '#888' : '#ccc'} />
              <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleSearchSeekers} onPressIn={() => handlePressIn(searchScale)} onPressOut={() => handlePressOut(searchScale)} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: searchScale }] }}>
                  <Text style={styles.buttonText}>Search Seekers</Text>
                </Animated.View>
              </TouchableOpacity>
              <FlatList
                data={seekers}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listItem} onPress={() => handleViewSeekerProfile(item._id)}>
                    <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>{item.fullName} - {item.skills?.join(', ') || 'N/A'} - {item.location || 'N/A'}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />

              <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Your Posted Jobs</Text>
              <FlatList
                data={postedJobs}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.jobItem}>
                      <View style={styles.jobNameContainer}>
                        <TouchableOpacity onPress={() => handleEditJob(item)}>
                          <Text style={[styles.jobText, isDarkMode ? styles.darkText : styles.lightText]}>{item.jobTitle}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleActiveInactiveJob(item)} 
                          style={[styles.jobActiveBtn, item.available ? styles.jobActive : styles.jobInactive]}
                        >
                          <Text style={styles.jobActiveText}>
                            {item.available ? 'Active' : 'Inactive'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.jobActions}>
                        <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => handleViewApplicants(item._id)}>
                          <Text style={styles.buttonText}>View Applicants</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => handleEditJob(item)} onPressIn={() => handlePressIn(editJobScale)} onPressOut={() => handlePressOut(editJobScale)}>
                          <Animated.View style={{ transform: [{ scale: editJobScale }] }}>
                            <Text style={styles.buttonText}>Edit Job</Text>
                          </Animated.View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => handleDeleteJob(item._id)} onPressIn={() => handlePressIn(deleteJobScale)} onPressOut={() => handlePressOut(deleteJobScale)}>
                          <Animated.View style={{ transform: [{ scale: deleteJobScale }] }}>
                            <Text style={styles.buttonText}>Delete Job</Text>
                          </Animated.View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
                scrollEnabled={false}
              />
              
              {/* changes - use applicants.find instead of seekers.find */}
              {/* Seeker Profile Modal */}
              <Modal visible={showSeekerProfileModal} transparent={true} animationType="slide" onRequestClose={() => setShowSeekerProfileModal(false)}>
                <View style={[styles.modalOverlay, { zIndex: 10 }]}>
                  <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                    <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Seeker Profile</Text>
                    {renderSeekerProfile(
                      seekers.find(s => s._id === selectedSeekerId) || 
                      applicants.find(a => a.seeker?._id === selectedSeekerId)?.seeker || 
                      null
                    )}
                    <TouchableOpacity style={[styles.closeButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleCloseSeekerProfileModal} activeOpacity={0.8}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Applicants Modal */}
              <Modal visible={!!selectedJobId} transparent={true} animationType="slide" onRequestClose={() => setSelectedJobId(null)}>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                    <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>Applicants for {postedJobs.find(j => j._id === selectedJobId)?.jobTitle}</Text>
                    <FlatList
                      data={applicants.filter(applicant => applicant.jobId === selectedJobId)}
                      keyExtractor={(item) => item._id.toString()}
                      renderItem={({ item }) => {
                        // Check if seeker is null
                        if (!item.seeker) {
                          return (
                            <View style={styles.listItem}>
                              <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                                No seeker data available for this applicant.
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View style={styles.listItem}>
                            <Text style={[styles.itemText, isDarkMode ? styles.darkText : styles.lightText]}>
                              {item.seeker.fullName} - {item.seeker.email || 'N/A'}
                            </Text>
                            <TouchableOpacity
                              style={[styles.actionButton, isDarkMode ? styles.darkButton : styles.lightButton]}
                              onPress={() => handleViewSeekerProfile(item.seeker._id)}
                            >
                              <Text style={styles.buttonText}>View More</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }}
                    />
                    <TouchableOpacity style={[styles.closeButton, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => setSelectedJobId(null)} activeOpacity={0.8}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Job Details Modal */}
              <Modal
              visible={!!selectedJobForEdit}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setSelectedJobForEdit(null)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDarkMode ? styles.darkModal : styles.lightModal]}>
                  
                  {/* Modal Title */}
                  <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                    Edit Job
                  </Text>

                  {/* Job Title */}
                  <Text style={styles.label}>Job Title</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Job Title"
                    value={jobTitle || ''}
                    onChangeText={setJobTitle}
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Skills */}
                  <Text style={styles.label}>Skills (comma-separated)</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Required Skills"
                    value={skills || ''}
                    onChangeText={setSkills}
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Experience Required */}
                  <Text style={styles.label}>Experience Required (years)</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Experience in Years"
                    value={experienceRequired || ''}
                    onChangeText={setExperienceRequired}
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Location */}
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Job Location"
                    value={location || ''}
                    onChangeText={setLocation}
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Max CTC */}
                  <Text style={styles.label}>Max CTC</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Maximum CTC"
                    value={maxCTC || ''}
                    onChangeText={setMaxCTC}
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Notice Period */}
                  <Text style={styles.label}>Notice Period</Text>
                  <TextInput
                    style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                    placeholder="Enter Notice Period"
                    value={noticePeriod || ''}
                    onChangeText={setNoticePeriod}
                    placeholderTextColor={isDarkMode ? '#888' : '#ccc'}
                  />

                  {/* Save Changes Button */}
                  <TouchableOpacity
                    style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                    onPress={handleUpdateJob}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setSelectedJobForEdit(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>

                   {/* Close Button */}
                   <TouchableOpacity
                      style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
                      onPress={() => setSelectedJobForEdit(null)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>Close</Text>
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#111' },
  scrollContent: { paddingBottom: 60, flexGrow: 1 },
  content: { padding: 10, flexGrow: 1 },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  lightInput: { borderColor: '#ccc', color: '#000' },
  darkInput: { borderColor: '#555', color: '#ddd', backgroundColor: '#333' },
  listItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  itemText: { fontSize: 16, marginBottom: 5 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#007AFF' },
  checkboxText: { color: '#fff' },
  jobItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  jobText: { fontSize: 16 },
  jobActions: { flexDirection: 'row', gap: 10, marginTop: 5 },
  actionButton: { padding: 5, borderRadius: 5 },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', marginBottom: 10 },
  lightButton: { backgroundColor: '#007AFF' },
  darkButton: { backgroundColor: '#005BB5' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, },
  modalContent: { width: '90%', padding: 20, borderRadius: 10 },
  lightModal: { backgroundColor: '#fff' },
  darkModal: { backgroundColor: '#333' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { marginTop: 10, padding: 10, borderRadius: 5, alignItems: 'center' },
  loading: { fontSize: 16, textAlign: 'center' },
  lightText: { color: '#000' },
  darkText: { color: '#ddd' },
  jobActiveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  jobActive: { 
    backgroundColor: 'green',
  },
 jobInactive: { 
    backgroundColor: 'red',
  },
  jobActiveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobNameContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    paddingHorizontal: 10
  },

});