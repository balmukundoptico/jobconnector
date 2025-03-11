import React, { useState, Component } from 'react'; // React core
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; // Navigation setup
import { createStackNavigator } from '@react-navigation/stack'; // Stack navigator
import { View, Text, StyleSheet } from 'react-native'; // RN components
import Home from './pages/Home'; // Home screen
import AuthForm from './pages/AuthForm'; // Auth screen
import Register from './pages/Register'; // Register screen
import SeekerProfile from './pages/SeekerProfile'; // Seeker profile
import ProviderProfile from './pages/ProviderProfile'; // Provider profile
import SeekerDashboard from './pages/SeekerDashboard'; // Seeker dashboard
import ProviderDashboard from './pages/ProviderDashboard'; // Provider dashboard
import AdminDashboard from './pages/AdminDashboard'; // Admin dashboard

const Stack = createStackNavigator(); // Create stack navigator instance

// ErrorBoundary class to catch runtime errors
class ErrorBoundary extends Component {
  state = { hasError: false, error: null }; // Initial state
  static getDerivedStateFromError(error) { // Update state on error
    console.log('Error caught:', error.message);
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) { // Log error details
    console.error('Error details:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) { // Show error message if caught
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children; // Render children if no error
  }
}

// Main App component
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode toggle state
  const toggleDarkMode = () => setIsDarkMode(prev => !prev); // Toggle function

  console.log('App rendering'); // Log rendering

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <ErrorBoundary>
        <View style={styles.container}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
              name="Home" 
              options={{
                headerShown: false, // Hides the header completely
                headerLeft: () => null, // Explicitly removes back button if header is shown
              }}
              children={props => <Home {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="AuthForm" 
              options={{ headerShown: false }}
              children={props => <AuthForm {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="Register" 
              options={{ headerShown: false }}
              children={props => <Register {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="SeekerProfile" 
              options={{ headerShown: false }}
              children={props => <SeekerProfile {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="ProviderProfile" 
              options={{ headerShown: false }}
              children={props => <ProviderProfile {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="SeekerDashboard" 
              options={{ headerShown: false }}
              children={props => <SeekerDashboard {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="ProviderDashboard" 
              options={{ headerShown: false }}
              children={props => <ProviderDashboard {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
            <Stack.Screen 
              name="AdminDashboard" 
              options={{ headerShown: false }}
              children={props => <AdminDashboard {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
            />
          </Stack.Navigator>
        </View>
      </ErrorBoundary>
    </NavigationContainer>
  );
}

// Styles for the app
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, // Full-screen container
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }, // Error screen styling
  errorText: { color: '#000' } // Error text styling
});