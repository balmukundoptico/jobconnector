import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title, toggleDarkMode, isDarkMode }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const canGoBack = navigation.canGoBack();
  const shineAnim = useRef(new Animated.Value(1)).current; // Animation value for shine effect

  const handleToggle = () => {
    // Trigger shine animation
    Animated.sequence([
      Animated.timing(shineAnim, {
        toValue: 1.5, // Scale up
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: 1, // Scale back
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggleDarkMode(); // Toggle mode
  };

  return (
    <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
      {canGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDarkMode ? '#ddd' : '#fff'} />
        </TouchableOpacity>
      )}
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
        {title || 'JobConnector'}
      </Text>
      <View style={styles.rightContainer}>
        <TouchableOpacity 
          onPress={handleToggle} 
          style={[
            styles.modeButton, 
            isDarkMode ? styles.darkModeButton : styles.lightModeButton,
          ]}
        >
          <Animated.View style={{ transform: [{ scale: shineAnim }] }}>
            <View style={styles.bulbContainer}>
              <Icon 
                name={isDarkMode ? 'lightbulb-outline' : 'lightbulb'} 
                size={24} 
                color={isDarkMode ? '#ddd' : '#ffd700'} // Yellow in light mode for "on" effect
              />
              {!isDarkMode && (
                <Icon 
                  name="flare" 
                  size={30} 
                  color="rgba(255, 215, 0, 0.5)" // Semi-transparent yellow rays
                  style={styles.rays}
                />
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AuthForm', { role: 'admin' })} 
          style={styles.adminButton}
        >
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
    paddingTop: 40,
    borderBottomWidth: 1,
  },
  lightHeader: { 
    backgroundColor: '#007AFF', 
    borderBottomColor: '#005BB5' 
  },
  darkHeader: { 
    backgroundColor: '#333', 
    borderBottomColor: '#555' 
  },
  backButton: { 
    padding: 10 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  rightContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modeButton: { 
    padding: 8, 
    borderWidth: 2, 
    borderRadius: 16, // Circular border
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightModeButton: { 
    borderColor: '#fff', // White border in light mode
  },
  darkModeButton: { 
    borderColor: '#ffd700', // Yellow border in dark mode
  },
  adminButton: { 
    padding: 10 
  },
  lightText: { 
    color: '#fff' 
  },
  darkText: { 
    color: '#ddd' 
  },
  bulbContainer: {
    position: 'relative',
  },
  rays: {
    position: 'absolute',
    top: -3,
    left: -3,
    zIndex: -1, // Behind the bulb
  },
});

export default Header;