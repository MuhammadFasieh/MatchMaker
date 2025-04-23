/**
 * API service for interacting with the backend
 */

// Base API URL - will use relative URL when deployed together
const API_URL = 'http://localhost:5001/api';

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
  
  // For non-JSON responses
  if (!response.ok) {
    throw new Error('API Error');
  }
  
  return { success: true };
};

// Get the auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log("Auth token retrieved from localStorage:", token ? "exists" : "not found");
  return token;
};

// Configure request headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("Added Authorization header with Bearer token");
  } else {
    console.warn("No token available for Authorization header");
  }
  
  return headers;
};

// Wrapper for fetch API with authentication
const safeFetch = async (url, options = {}) => {
  // Ensure headers exist
  options.headers = options.headers || {};
  
  // Add auth headers if not specifically disabled
  if (options.auth !== false) {
    const authHeaders = getAuthHeaders();
    Object.assign(options.headers, authHeaders);
    console.log(`Request to ${url} with auth:`, options.method || 'GET');
    delete options.auth;
  } else {
    console.log(`Request to ${url} without auth:`, options.method || 'GET');
  }
  
  try {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, options);
    console.log(`Response status from ${url}:`, response.status);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${url}):`, error);
    throw error;
  }
};

// Authentication API
export const auth = {
  // Register a new user
  register: async (userData) => {
    // Create FormData if there are file uploads
    let body;
    let options = {
      method: 'POST',
      auth: false // No auth for registration
    };
    
    if (userData.image || userData.cv) {
      body = new FormData();
      
      // Add all text fields
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && typeof userData[key] !== 'object') {
          body.append(key, userData[key]);
        }
      });
      
      // Add file fields
      if (userData.image) body.append('profileImage', userData.image);
      if (userData.cv) body.append('cv', userData.cv);
      
      // Don't set Content-Type header - browser will set it with boundary
      options.headers = {};
    } else {
      // JSON request
      body = JSON.stringify(userData);
      options.headers = { 'Content-Type': 'application/json' };
    }
    
    options.body = body;
    
    return await safeFetch(`${API_URL}/auth/register`, options);
  },
  
  // Login user
  login: async (credentials) => {
    return await safeFetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { 'Content-Type': 'application/json' },
      auth: false // No auth for login
    });
  },
  
  // Logout user
  logout: async () => {
    return await safeFetch(`${API_URL}/auth/logout`, {
      method: 'GET'
    });
  },
  
  // Get user profile
  getProfile: async () => {
    return await safeFetch(`${API_URL}/auth/profile`, {
      method: 'GET'
    });
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    // Handle file uploads if present
    let body;
    let options = {
      method: 'PUT'
    };
    
    if (profileData.profileImage || profileData.cv) {
      body = new FormData();
      
      // Add all text fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && typeof profileData[key] !== 'object') {
          body.append(key, profileData[key]);
        }
      });
      
      // Add file fields
      if (profileData.profileImage) body.append('profileImage', profileData.profileImage);
      if (profileData.cv) body.append('cv', profileData.cv);
      
      // Don't set Content-Type header - browser will set it with boundary
      options.headers = getAuthHeaders();
      delete options.headers['Content-Type'];
    } else {
      // JSON request
      body = JSON.stringify(profileData);
      options.headers = getAuthHeaders();
    }
    
    options.body = body;
    
    return await safeFetch(`${API_URL}/auth/profile`, options);
  }
};

// Dashboard API
export const dashboard = {
  // Get user dashboard data
  getDashboard: async () => {
    return await safeFetch(`${API_URL}/dashboard`, {
      method: 'GET'
    });
  },
  
  // Renamed to match what's used in Dashboard.jsx
  getDashboardData: async () => {
    return await safeFetch(`${API_URL}/dashboard`, {
      method: 'GET'
    });
  },
  
  // Check if application is ready to submit
  checkApplicationReadiness: async () => {
    return await safeFetch(`${API_URL}/dashboard/check-readiness`, {
      method: 'GET'
    });
  },
  
  // Update dashboard section progress
  updateSectionProgress: async (sectionName, isComplete) => {
    return await safeFetch(`${API_URL}/dashboard/${sectionName}`, {
      method: 'PUT',
      body: JSON.stringify({ isComplete }),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Update dashboard data (keep for backward compatibility)
  updateSection: async (sectionName, data) => {
    return await safeFetch(`${API_URL}/dashboard/${sectionName}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Personal Statement API
export const personalStatement = {
  // Get user's personal statement
  get: async () => {
    return await safeFetch(`${API_URL}/personal-statement`, {
      method: 'GET'
    });
  },
  
  // Create or update personal statement
  save: async (data) => {
    return await safeFetch(`${API_URL}/personal-statement`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Generate statement with AI
  generate: async (prompt) => {
    return await safeFetch(`${API_URL}/personal-statement/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Research Products API
export const research = {
  // Get all research products
  getAll: async () => {
    return await safeFetch(`${API_URL}/research`, {
      method: 'GET'
    });
  },
  
  // Get single research product
  get: async (id) => {
    return await safeFetch(`${API_URL}/research/${id}`, {
      method: 'GET'
    });
  },
  
  // Create new research product
  create: async (data) => {
    return await safeFetch(`${API_URL}/research`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Update research product
  update: async (id, data) => {
    return await safeFetch(`${API_URL}/research/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Delete research product
  delete: async (id) => {
    return await safeFetch(`${API_URL}/research/${id}`, {
      method: 'DELETE'
    });
  }
};

// Experiences API
export const experiences = {
  // Get all experiences
  getAll: async () => {
    return await safeFetch(`${API_URL}/experiences`, {
      method: 'GET'
    });
  },
  
  // Get single experience
  get: async (id) => {
    return await safeFetch(`${API_URL}/experiences/${id}`, {
      method: 'GET'
    });
  },
  
  // Create new experience
  create: async (data) => {
    return await safeFetch(`${API_URL}/experiences`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Update experience
  update: async (id, data) => {
    return await safeFetch(`${API_URL}/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Delete experience
  delete: async (id) => {
    return await safeFetch(`${API_URL}/experiences/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Mark experience as most meaningful
  markMostMeaningful: async (id) => {
    return await safeFetch(`${API_URL}/experiences/${id}/most-meaningful`, {
      method: 'PUT'
    });
  }
};

// Programs API
export const programs = {
  // Search for programs
  search: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return await safeFetch(`${API_URL}/programs/search?${queryString}`, {
      method: 'GET'
    });
  },
  
  // Get single program
  get: async (id) => {
    return await safeFetch(`${API_URL}/programs/${id}`, {
      method: 'GET'
    });
  },
  
  // Save program to favorites
  saveToFavorites: async (id) => {
    return await safeFetch(`${API_URL}/programs/${id}/favorite`, {
      method: 'PUT'
    });
  },
  
  // Remove program from favorites
  removeFromFavorites: async (id) => {
    return await safeFetch(`${API_URL}/programs/${id}/favorite`, {
      method: 'DELETE'
    });
  },
  
  // Get favorite programs
  getFavorites: async () => {
    return await safeFetch(`${API_URL}/programs/favorites`, {
      method: 'GET'
    });
  }
};

// Miscellaneous Questions API
export const miscQuestions = {
  // Get all user's misc questions
  getAll: async () => {
    return await safeFetch(`${API_URL}/misc-questions`, {
      method: 'GET'
    });
  },
  
  // Save misc questions
  save: async (data) => {
    return await safeFetch(`${API_URL}/misc-questions`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Generate answer with AI
  generateAnswer: async (questionId, prompt) => {
    return await safeFetch(`${API_URL}/misc-questions/${questionId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Applications API
export const applications = {
  // Get all applications
  getAll: async () => {
    return await safeFetch(`${API_URL}/applications`, {
      method: 'GET'
    });
  },
  
  // Get single application
  get: async (id) => {
    return await safeFetch(`${API_URL}/applications/${id}`, {
      method: 'GET'
    });
  },
  
  // Create new application
  create: async (data) => {
    return await safeFetch(`${API_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Update application
  update: async (id, data) => {
    return await safeFetch(`${API_URL}/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Delete application
  delete: async (id) => {
    return await safeFetch(`${API_URL}/applications/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Submit application
  submit: async (id) => {
    return await safeFetch(`${API_URL}/applications/${id}/submit`, {
      method: 'PUT'
    });
  },
  
  // Get application status
  getStatus: async (id) => {
    return await safeFetch(`${API_URL}/applications/${id}/status`, {
      method: 'GET'
    });
  }
}; 