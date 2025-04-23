import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

// Mock user data (fallback if nothing in localStorage)
const MOCK_USER = {
  id: 'mock-user-123',
  firstName: 'Demo',
  lastName: 'User',
  email: 'user@example.com',
  phone: '+1 (555) 123-4567',
  university: 'Johns Hopkins University School of Medicine',
  specialty: 'Cardiology',
  graduationYear: '2023',
  profileImage: null
};

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user state from localStorage when the app loads
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // First check if we have a token
        const token = localStorage.getItem('token');
        
        if (token) {
          // Try to get stored user data
          const storedUser = localStorage.getItem('user');
          
          if (storedUser) {
            // If we have stored user data, use it
            setCurrentUser(JSON.parse(storedUser));
          } else {
            // If no stored user but we have a token, try to fetch user data
            try {
              const response = await auth.getProfile();
              if (response && response.success) {
                setCurrentUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
              } else {
                // If API fails, just use an empty object, no mock data
                setCurrentUser({});
                localStorage.setItem('user', JSON.stringify({}));
              }
            } catch (err) {
              console.error("Error fetching user profile:", err);
              // If fetching fails, just use an empty object
              setCurrentUser({});
              localStorage.setItem('user', JSON.stringify({}));
            }
          }
        } else {
          // For demo purposes, create a token but no default user data
          localStorage.setItem('token', 'fake-jwt-token');
          // Don't set any mock user data by default
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle user registration
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a user object with provided data
      const userToRegister = {
        ...MOCK_USER,
        ...userData,
        id: `user-${Date.now()}`, // Generate a unique ID
        firstName: userData.firstName || MOCK_USER.firstName,
        lastName: userData.lastName || MOCK_USER.lastName,
        email: userData.email || MOCK_USER.email
      };
      
      const response = await auth.register(userToRegister);
      
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Customize the mock user with the email from credentials
      const customUser = {
        ...MOCK_USER,
        email: credentials.email || MOCK_USER.email,
        firstName: credentials.email.split('@')[0] || MOCK_USER.firstName
      };
      
      // For demo, modify the API call to use our custom user
      auth.MOCK_USER = customUser;
      
      const response = await auth.login(credentials);
      
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = () => {
    // Remove token and user data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset current user state to null
    setCurrentUser(null);
    
    // Set loading state for UI feedback
    setLoading(true);
    
    // Wait a bit to simulate logout process
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await auth.updateProfile(profileData);
      
      // Update current user data and localStorage
      setCurrentUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Value object to be provided by the context
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 