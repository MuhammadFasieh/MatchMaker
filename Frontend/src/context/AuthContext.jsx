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
        console.group('🔐 Authentication Initialization');
        // Check if we have a token
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        // Check if a user is already in session storage (for fast page reloads)
        const sessionUser = sessionStorage.getItem('currentUser');
        let parsedSessionUser = null;
        
        if (sessionUser) {
          try {
            parsedSessionUser = JSON.parse(sessionUser);
            console.log('Session user found:', parsedSessionUser.email || 'unknown');
          } catch (e) {
            console.error('Error parsing session user:', e);
            sessionStorage.removeItem('currentUser');
          }
        }
        
        if (token) {
          console.log('Token found in localStorage, validating...');
          try {
            // Attempt to decode the token to check if it's valid
            const isTokenExpired = () => {
              try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < currentTime;
                
                console.log('Token expiry check:', {
                  current: new Date(currentTime * 1000).toISOString(),
                  expires: new Date(payload.exp * 1000).toISOString(),
                  isExpired,
                  timeLeft: payload.exp - currentTime
                });
                
                return isExpired;
              } catch (err) {
                console.error('Error decoding token:', err);
                return true; // Assume expired if we can't decode
              }
            };
            
            // If token is expired, clear it and set user to null
            if (isTokenExpired()) {
              console.warn('🚫 Token is expired, clearing auth state');
              localStorage.removeItem('token');
              sessionStorage.removeItem('currentUser');
              setCurrentUser(null);
              setLoading(false);
              console.groupEnd();
              return;
            }
            
            // If we have a valid session user and a valid token, use the session user
            if (parsedSessionUser) {
              console.log('✅ Using cached session user');
              setCurrentUser(parsedSessionUser);
              setLoading(false);
              console.groupEnd();
              return;
            }
            
            // Fetch user data from backend
            console.log('🔄 Token appears valid, fetching user profile');
            const response = await auth.getProfile();
            console.log('Profile response:', response);
            
            if (response && (response.success || response.user)) {
              const userObj = response.user || response;
              console.log('✅ Setting user from profile response:', userObj);
              setCurrentUser(userObj);
              
              // Save user to session storage for fast page reloads
              sessionStorage.setItem('currentUser', JSON.stringify(userObj));
            } else if (response && response.networkError) {
              // Handle network error - keep token but set temp null user
              console.warn('⚠️ Network error fetching profile, keeping token');
              if (parsedSessionUser) {
                console.log('Using cached session user');
                setCurrentUser(parsedSessionUser);
              } else {
                setCurrentUser(null);
              }
            } else {
              // Token is invalid or expired or user not found
              console.warn('🚫 Valid token but invalid profile response, clearing auth state');
              localStorage.removeItem('token');
              sessionStorage.removeItem('currentUser');
              setCurrentUser(null);
            }
          } catch (err) {
            console.error("❌ Error fetching user profile:", err);
            
            // If network error, keep the token and use session user if available
            if (err.message && (
              err.message.includes('network') || 
              err.message.includes('Network') ||
              err.message.includes('Failed to fetch')
            )) {
              console.warn('⚠️ Network error, keeping token');
              if (parsedSessionUser) {
                console.log('Using cached session user');
                setCurrentUser(parsedSessionUser);
              } else {
                setCurrentUser(null);
              }
            }
            // If auth error, clear token and user
            else if (err.message && (
              err.message.includes('401') || 
              err.message.includes('unauthorized') || 
              err.message.includes('Unauthorized') ||
              err.message.includes('token') ||
              err.message.includes('Token')
            )) {
              console.warn('🚫 Auth error indicates invalid token, clearing auth state');
              localStorage.removeItem('token');
              sessionStorage.removeItem('currentUser');
              setCurrentUser(null);
            } else {
              console.warn('⚠️ Unknown error, keeping token for retry');
              // Keep the token but set user to null or use session user
              if (parsedSessionUser) {
                console.log('Using cached session user');
                setCurrentUser(parsedSessionUser);
              } else {
                setCurrentUser(null);
              }
            }
          }
        } else {
          console.log('No token found, user is not authenticated');
          sessionStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
        console.groupEnd();
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
        // Save user in both state and session storage
        setCurrentUser(response.user);
        sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        console.log('User set from login response and saved to session storage');
      } else {
        // If no user in response, fetch profile
        try {
          const profileResponse = await auth.getProfile();
          if (profileResponse && profileResponse.success && profileResponse.user) {
            // Save user in both state and session storage
            setCurrentUser(profileResponse.user);
            sessionStorage.setItem('currentUser', JSON.stringify(profileResponse.user));
            console.log('User set from profile fetch and saved to session storage');
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
      // Clear all auth-related storage
      localStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
      
      // Reset current user state to null
      setCurrentUser(null);
      
      console.log('User logged out, all auth data cleared');
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