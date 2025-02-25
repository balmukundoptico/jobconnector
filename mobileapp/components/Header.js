// mobileapp/components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons for simplicity

const Header = ({ title, toggleDarkMode, isDarkMode }) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={isDarkMode ? '#ddd' : '#fff'} />
      </TouchableOpacity>
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>{title || 'JobConnector'}</Text>
      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={toggleDarkMode} style={styles.modeButton}>
          <Icon name={isDarkMode ? 'wb-sunny' : 'nightlight-round'} size={24} color={isDarkMode ? '#ddd' : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AuthForm', { role: 'admin' })} style={styles.adminButton}>
          <Icon name="settings" size={24} color={isDarkMode ? '#ddd' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 40, // Lowered from top
    borderBottomWidth: 1,
  },
  lightHeader: { backgroundColor: '#007AFF', borderBottomColor: '#005BB5' },
  darkHeader: { backgroundColor: '#333', borderBottomColor: '#555' },
  backButton: { padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  rightContainer: { flexDirection: 'row', alignItems: 'center' },
  modeButton: { padding: 10 },
  adminButton: { padding: 10 },
  lightText: { color: '#fff' },
  darkText: { color: '#ddd' },
});

export default Header;