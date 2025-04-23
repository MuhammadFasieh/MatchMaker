import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user state from JWT token only
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Fetch user data from backend
            const response = await auth.getProfile();
            if (response && response.success) {
              setCurrentUser(response.user);
            } else {
              // Token is invalid or expired
              localStorage.removeItem('token');
              setCurrentUser(null);
            }
          } catch (err) {
            console.error("Error fetching user profile:", err);
            // If fetching fails, clear token and set user to null
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
        setCurrentUser(null);
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
      
      // Send registration data to backend
      const response = await auth.register(userData);
      
      // Save only the token, not user data
      localStorage.setItem('token', response.token);
      
      // Set user from response
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
      console.log(`Attempting login with email: ${credentials.email}`);
      setLoading(true);
      setError(null);
      
      // Extract email and password from credentials
      const email = credentials.email;
      const password = credentials.password;
      
      // Make sure both email and password are provided
      if (!email || !password) {
        throw new Error('Please provide an email and password');
      }
      
      // Call the login API with email and password
      const response = await auth.login({
        email,
        password
      });

      console.log('Login API response:', response);

      // The server returns a token directly in the response
      if (!response || !response.token) {
        console.error('No token received from login API');
        throw new Error('Authentication token not received');
      }

      // Store token in local storage
      localStorage.setItem('token', response.token);
      console.log('Token stored in localStorage');

      // Set user from response
      if (response.user) {
        setCurrentUser(response.user);
        console.log('User set from login response');
      } else {
        // If no user in response, fetch profile
        try {
          const profileResponse = await auth.getProfile();
          if (profileResponse && profileResponse.success && profileResponse.user) {
            setCurrentUser(profileResponse.user);
            console.log('User set from profile fetch');
          }
        } catch (profileError) {
          console.warn('Could not fetch user profile:', profileError);
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error.message || error);
      setLoading(false);
      setError(error.message || 'An error occurred during login');
      return false;
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      // Call logout endpoint if server needs to invalidate token
      await auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Remove token from local storage
      localStorage.removeItem('token');
      
      // Reset current user state to null
      setCurrentUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await auth.updateProfile(profileData);
      
      // Update current user data
      setCurrentUser(response.user);
      
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