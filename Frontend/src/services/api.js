/**
 * API service for interacting with the backend
 */

// Base API URL - will use relative URL when deployed together
const API_URL = '/api';

// Mock user data for fake authentication, can be customized at runtime
let MOCK_USER = {
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

// Simulated local database for development
const LocalDB = {
  // Initialize the database with default values if needed
  init: () => {
    // First clear any old data format
    if (localStorage.getItem('dashboardData')) {
      localStorage.removeItem('dashboardData');
    }
    if (localStorage.getItem('user')) {
      // Migrate old user data to new format
      try {
        const oldUser = JSON.parse(localStorage.getItem('user'));
        if (oldUser && !localStorage.getItem('localDB_user')) {
          localStorage.setItem('localDB_user', JSON.stringify(oldUser));
        }
      } catch (e) {
        console.warn('Failed to migrate old user data', e);
      }
      localStorage.removeItem('user');
    }
    
    // Check if user exists
    if (!localStorage.getItem('localDB_user')) {
      const defaultUser = {
        id: `user-${Date.now()}`,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@medical.edu',
        phone: '+1 (555) 123-4567',
        university: 'Johns Hopkins University School of Medicine',
        specialty: 'Cardiology',
        graduationYear: '2023',
        profileImage: null
      };
      localStorage.setItem('localDB_user', JSON.stringify(defaultUser));
    } else {
      // Ensure all required fields exist
      try {
        const user = JSON.parse(localStorage.getItem('localDB_user'));
        const updatedUser = {
          ...user,
          phone: user.phone || '+1 (555) 123-4567',
          university: user.university || 'Johns Hopkins University School of Medicine',
          specialty: user.specialty || 'Cardiology',
          graduationYear: user.graduationYear || '2023'
        };
        localStorage.setItem('localDB_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Error updating user fields', e);
      }
    }

    // Check if dashboard data exists
    if (!localStorage.getItem('localDB_dashboard')) {
      const defaultDashboard = {
        sections: {
          personalStatement: {
            isComplete: false,
            status: 'Not Started'
          },
          researchProducts: {
            isComplete: false,
            count: 0,
            status: 'Not Started'
          },
          experiences: {
            isComplete: false,
            count: 0,
            mostMeaningfulCount: 0,
            status: 'Not Started'
          },
          miscellaneous: {
            isComplete: false,
            status: 'Not Started'
          },
          programPreference: {
            isComplete: false,
            status: 'Not Started'
          }
        }
      };
      localStorage.setItem('localDB_dashboard', JSON.stringify(defaultDashboard));
    }
  },

  // Get user data
  getUser: () => {
    LocalDB.init(); // Ensure DB is initialized
    const userData = localStorage.getItem('localDB_user');
    return userData ? JSON.parse(userData) : null;
  },

  // Update user data
  updateUser: (userData) => {
    const currentUser = LocalDB.getUser() || {};
    const updatedUser = { ...currentUser, ...userData };
    
    // Ensure required fields
    if (!updatedUser.phone) updatedUser.phone = '+1 (555) 123-4567';
    if (!updatedUser.university) updatedUser.university = 'Johns Hopkins University School of Medicine';
    if (!updatedUser.specialty) updatedUser.specialty = 'Cardiology';
    if (!updatedUser.graduationYear) updatedUser.graduationYear = '2023';
    
    localStorage.setItem('localDB_user', JSON.stringify(updatedUser));
    
    // For debugging
    console.log('Updated user data:', updatedUser);
    
    return updatedUser;
  },

  // Get dashboard data
  getDashboard: () => {
    LocalDB.init(); // Ensure DB is initialized
    const dashboardData = localStorage.getItem('localDB_dashboard');
    return dashboardData ? JSON.parse(dashboardData) : null;
  },

  // Update dashboard data
  updateDashboard: (dashboardData) => {
    const currentDashboard = LocalDB.getDashboard() || {};
    const updatedDashboard = { ...currentDashboard, ...dashboardData };
    localStorage.setItem('localDB_dashboard', JSON.stringify(updatedDashboard));
    return updatedDashboard;
  },

  // Update a section in the dashboard
  updateSection: (sectionName, data) => {
    const dashboard = LocalDB.getDashboard();
    if (dashboard && dashboard.sections && dashboard.sections[sectionName]) {
      dashboard.sections[sectionName] = {
        ...dashboard.sections[sectionName],
        ...data
      };

      // Recalculate progress
      let completedSections = 0;
      const totalSections = Object.keys(dashboard.sections).length;
      
      Object.values(dashboard.sections).forEach(section => {
        if (section.isComplete) completedSections++;
      });
      
      const percentageComplete = Math.round((completedSections / totalSections) * 100);
      
      // Update progress data
      dashboard.progress = {
        completedSections,
        totalSections,
        percentageComplete
      };

      localStorage.setItem('localDB_dashboard', JSON.stringify(dashboard));
    }
    
    return LocalDB.getDashboard();
  },

  // Clear all local database data (for testing/logout)
  clear: () => {
    localStorage.removeItem('localDB_user');
    localStorage.removeItem('localDB_dashboard');
  }
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      // Handle API error responses
      const error = data.message || 'API Error';
      throw new Error(error);
    }
    
    return data;
  }
  
  // Handle non-JSON responses
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  return response.text();
};

// Get a user from localStorage if available
const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    return null;
  }
};

// Wrap fetch requests with error handling
const safeFetch = async (url, options = {}) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error('Network error:', error);
    // For demo purposes, return a fake successful response with mock data
    const savedUser = getSavedUser() || MOCK_USER;
    
    return {
      ok: true,
      headers: {
        get: () => 'application/json'
      },
      json: () => Promise.resolve({ 
        success: true,
        token: 'fake-jwt-token',
        user: savedUser
      })
    };
  }
};

// Get authentication token from local storage
const getAuthToken = () => localStorage.getItem('token');

// Authentication API calls - updated to use LocalDB for user data
export const auth = {
  // Reference to MOCK_USER so it can be customized at runtime
  MOCK_USER,
  
  // Register a new user - store in LocalDB
  register: async (userData) => {
    // Add an ID if not provided
    const userDataToSave = {
      id: userData.id || `user-${Date.now()}`,
      ...userData
    };
    
    // Ensure all required fields have defaults
    if (!userDataToSave.phone) userDataToSave.phone = '+1 (555) 123-4567';
    if (!userDataToSave.university) userDataToSave.university = 'Johns Hopkins University School of Medicine';
    if (!userDataToSave.specialty) userDataToSave.specialty = 'Cardiology';
    if (!userDataToSave.graduationYear) userDataToSave.graduationYear = '2023';
    
    // Save to LocalDB
    LocalDB.updateUser(userDataToSave);
    
    // Generate a fake token
    localStorage.setItem('token', 'fake-jwt-token');
    
    return {
      success: true,
      token: 'fake-jwt-token',
      user: userDataToSave
    };
  },
  
  // Login user - use LocalDB
  login: async (credentials) => {
    // For demo purposes, create or update user
    let customUser = {};
    
    // If customUserData is provided, use that
    if (credentials.customUserData) {
      customUser = { ...credentials.customUserData };
    } else {
      // Get existing user or create default
      customUser = LocalDB.getUser() || {};
    }
    
    // Add the email as it's a required field
    customUser.email = credentials.email || customUser.email;
    
    // Add id if not present
    if (!customUser.id) {
      customUser.id = `user-${Date.now()}`;
    }
    
    // Ensure all required fields have defaults
    if (!customUser.phone) customUser.phone = '+1 (555) 123-4567';
    if (!customUser.university) customUser.university = 'Johns Hopkins University School of Medicine';
    if (!customUser.specialty) customUser.specialty = 'Cardiology';
    if (!customUser.graduationYear) customUser.graduationYear = '2023';
    
    // Save to LocalDB
    LocalDB.updateUser(customUser);
    
    // Set token
    localStorage.setItem('token', 'fake-jwt-token');
    
    return {
      success: true,
      token: 'fake-jwt-token',
      user: customUser
    };
  },
  
  // Get user profile from LocalDB
  getProfile: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    // Get user from LocalDB
    const user = LocalDB.getUser();
    
    return {
      success: true,
      user: user || {}
    };
  },
  
  // Update user profile in LocalDB
  updateProfile: async (profileData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    // Update user in LocalDB
    const updatedUser = LocalDB.updateUser(profileData);
    
    return {
      success: true,
      user: updatedUser
    };
  }
};

// Personal statement API calls
export const personalStatement = {
  // Get personal statement data
  getPersonalStatement: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/personal-statement`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Save initial personal statement data
  savePersonalStatementData: async (data) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/personal-statement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  },
  
  // Generate thesis statements
  generateThesisStatements: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/personal-statement/generate-thesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Save selected thesis statement
  saveSelectedThesis: async (thesisData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/personal-statement/select-thesis`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thesisData)
    });
    
    return handleResponse(response);
  },
  
  // Generate final statement
  generateFinalStatement: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/personal-statement/generate-final`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Experiences API calls
export const experiences = {
  // Get all experiences
  getExperiences: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/experiences`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Create a new experience
  createExperience: async (experienceData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/experiences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experienceData)
    });
    
    return handleResponse(response);
  },
  
  // Update an experience
  updateExperience: async (id, experienceData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experienceData)
    });
    
    return handleResponse(response);
  },
  
  // Delete an experience
  deleteExperience: async (id) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/experiences/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Research API calls
export const research = {
  // Get all research entries
  getResearch: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/research`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Create a new research entry
  createResearch: async (researchData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/research`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(researchData)
    });
    
    return handleResponse(response);
  },
  
  // Update a research entry
  updateResearch: async (id, researchData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/research/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(researchData)
    });
    
    return handleResponse(response);
  },
  
  // Delete a research entry
  deleteResearch: async (id) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/research/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Programs API calls
export const programs = {
  // Get all programs
  getAllPrograms: async () => {
    const response = await fetch(`${API_URL}/programs`);
    return handleResponse(response);
  },
  
  // Search programs
  searchPrograms: async (searchParams) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${API_URL}/programs/search?${queryParams}`);
    return handleResponse(response);
  },
  
  // Get program details
  getProgramById: async (id) => {
    const response = await fetch(`${API_URL}/programs/${id}`);
    return handleResponse(response);
  },
  
  // Get user's program preferences
  getUserPreferences: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/programs/preferences`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Save program preference
  savePreference: async (preferenceData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/programs/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });
    
    return handleResponse(response);
  },
  
  // Update program preference
  updatePreference: async (id, preferenceData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/programs/preferences/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });
    
    return handleResponse(response);
  },
  
  // Remove a program preference
  removePreference: async (id) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/programs/preferences/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Miscellaneous questions API calls
export const misc = {
  // Get miscellaneous information
  getMiscInfo: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/misc`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Update miscellaneous information
  updateMiscInfo: async (miscData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/misc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(miscData)
    });
    
    return handleResponse(response);
  },
  
  // Submit answers to questions
  submitQuestions: async (questionsData) => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/misc/questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionsData)
    });
    
    return handleResponse(response);
  },
  
  // Get question responses
  getQuestionResponses: async () => {
    const token = getAuthToken();
    
    if (!token) throw new Error('Authentication required');
    
    const response = await fetch(`${API_URL}/misc/questions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

// Dashboard API calls - updated to use LocalDB
export const dashboard = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      // Initialize LocalDB if needed
      LocalDB.init();
      
      // Get user and dashboard data
      const user = LocalDB.getUser();
      const dashboardData = LocalDB.getDashboard();
      
      // Calculate progress if not already calculated
      if (!dashboardData.progress) {
        let completedSections = 0;
        const totalSections = Object.keys(dashboardData.sections).length;
        
        Object.values(dashboardData.sections).forEach(section => {
          if (section.isComplete) completedSections++;
        });
        
        const percentageComplete = Math.round((completedSections / totalSections) * 100);
        
        dashboardData.progress = {
          completedSections,
          totalSections,
          percentageComplete
        };
        
        // Save the calculated progress
        LocalDB.updateDashboard(dashboardData);
      }
      
      // Return formatted response
      return {
        success: true,
        dashboard: {
          user,
          sections: dashboardData.sections,
          progress: dashboardData.progress
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        message: 'Failed to load dashboard data'
      };
    }
  },
  
  // Check if application is ready for program recommendations
  checkApplicationReadiness: async () => {
    try {
      const dashboardData = LocalDB.getDashboard();
      let percentageComplete = 0;
      
      if (dashboardData && dashboardData.progress) {
        percentageComplete = dashboardData.progress.percentageComplete;
      } else {
        // Calculate if not available
        const response = await dashboard.getDashboardData();
        if (response.success) {
          percentageComplete = response.dashboard.progress.percentageComplete;
        }
      }
      
      // Application is ready if completion is at least 85%
      return {
        success: true,
        isReady: percentageComplete >= 85,
        percentageComplete
      };
    } catch (error) {
      console.error('Error checking application readiness:', error);
      return {
        success: false,
        message: 'Failed to check application readiness'
      };
    }
  },
  
  // Update section progress - uses LocalDB
  updateSectionProgress: async (sectionName, isComplete) => {
    try {
      // Update the section
      const updatedSection = {
        isComplete,
        status: isComplete ? 'Completed' : (isComplete === false ? 'In Progress' : 'Not Started')
      };
      
      LocalDB.updateSection(sectionName, updatedSection);
      
      // Return full dashboard data
      return await dashboard.getDashboardData();
    } catch (error) {
      console.error('Error updating section progress:', error);
      throw error;
    }
  }
}; 