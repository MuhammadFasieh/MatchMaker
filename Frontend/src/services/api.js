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
const getAuthHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = {};
  
  // Only set Content-Type for JSON requests, not for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
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
  
  // Add auth headers if not specifically disabled and if headers are not already set
  if (options.auth !== false && !options.headers['Authorization']) {
    const authHeaders = getAuthHeaders();
    // Only merge headers if they don't already exist
    Object.keys(authHeaders).forEach(key => {
      if (!options.headers[key]) {
        options.headers[key] = authHeaders[key];
      }
    });
    console.log(`Request to ${url} with auth:`, options.method || 'GET');
    delete options.auth;
  } else {
    console.log(`Request to ${url} with custom headers:`, options.method || 'GET');
  }
  
  try {
    console.log(`Fetching ${url}...`, options);
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
  
  // Direct method to mark personal statement as complete
  markComplete: async () => {
    return await safeFetch(`${API_URL}/personal-statement/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Generate statement with AI (if needed)
  generate: async (prompt) => {
    return await safeFetch(`${API_URL}/personal-statement/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Download personal statement as PDF
  downloadPDF: () => {
    const token = getAuthToken();
    const url = `${API_URL}/personal-statement/download-pdf`;
    
    // Create a hidden anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Add the auth token as a header
    if (token) {
      // For security reasons, we use a technique that works with the browser's API
      // This triggers a download with authentication
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `personal-statement-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error downloading PDF:', error);
        alert('Failed to download PDF. Please try again.');
      });
    } else {
      console.error('No auth token available for PDF download');
      alert('You must be logged in to download your personal statement.');
    }
    
    // This doesn't return a Promise because it handles the download directly
    return { success: true };
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
  },
  
  // Parse CV to extract research products
  parseCV: async (cvFile) => {
    const formData = new FormData();
    formData.append('cv', cvFile);
    
    try {
      console.log('Uploading CV file:', cvFile.name, cvFile.type, cvFile.size);
      
      // Get auth token
      const token = getAuthToken();
      const headers = {};
      
      // Only add Authorization header, no Content-Type for FormData
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("Added Authorization header for CV upload");
      }
      
      return await safeFetch(`${API_URL}/research/parse-cv`, {
        method: 'POST',
        body: formData,
        headers
      });
    } catch (error) {
      console.error('CV upload error:', error);
      throw error;
    }
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

// OpenAI API for Personal Statements
export const openai = {
  // Generate thesis statements
  generateThesisStatements: async (data) => {
    return await safeFetch(`${API_URL}/openai/thesis-statements`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Generate complete personal statement
  generatePersonalStatement: async (data) => {
    return await safeFetch(`${API_URL}/openai/personal-statement`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 