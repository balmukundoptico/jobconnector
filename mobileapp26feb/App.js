// mobileapp/App.js
import React, { useState, Component } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import Home from './pages/Home';
import AuthForm from './pages/AuthForm';
import Register from './pages/Register';
import SeekerProfile from './pages/SeekerProfile';
import ProviderProfile from './pages/ProviderProfile';
import SeekerDashboard from './pages/SeekerDashboard';

const Stack = createStackNavigator();

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.log('Error caught:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <Text style={{ color: '#000' }}>Error: {this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  console.log('App rendering');

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <ErrorBoundary>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {props => <Home {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="AuthForm" options={{ headerShown: false }}>
            {props => <AuthForm {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Register" options={{ headerShown: false }}>
            {props => <Register {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SeekerProfile" options={{ headerShown: false }}>
            {props => <SeekerProfile {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="ProviderProfile" options={{ headerShown: false }}>
            {props => <ProviderProfile {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SeekerDashboard" options={{ headerShown: false }}>
            {props => <SeekerDashboard {...props} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          </Stack.Screen>
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
}