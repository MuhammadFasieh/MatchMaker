const OpenAI = require('openai');
require('dotenv').config();

// Create a mock OpenAI client for development without an API key
const createMockOpenAIClient = () => {
  console.log('Creating mock OpenAI client for development/testing');
  
  const mockClient = {
    apiKey: null,
    chat: {
      completions: {
        create: async ({ model, messages }) => {
          console.log('Using mock OpenAI client - API Key is invalid or not configured');
          console.log('Query: ', messages[0].content.substring(0, 50) + '...');
          
          // For experience extraction, return a sample experience structure
          if (messages[0].content.includes('Extract all professional experiences')) {
            console.log('Returning mock experiences data');
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      experiences: [
                        {
                          organization: "Mock Organization (API key missing)",
                          experienceType: "Employment",
                          positionTitle: "Software Developer",
                          startDate: "01/2022",
                          endDate: "Present",
                          country: "United States",
                          state: "CA",
                          participationFrequency: "Full-time",
                          setting: "Remote",
                          primaryFocusArea: "Web Development",
                          description: "This is a mock response because OpenAI API key is not configured. Please add your API key to the .env file."
                        },
                        {
                          organization: "Sample University",
                          experienceType: "Education",
                          positionTitle: "Computer Science Student",
                          startDate: "09/2018",
                          endDate: "05/2022",
                          country: "United States",
                          state: "NY",
                          participationFrequency: "Full-time",
                          setting: "Academic",
                          primaryFocusArea: "Computer Science",
                          description: "Sample education experience for testing without a valid OpenAI API key"
                        }
                      ]
                    }),
                    role: "assistant"
                  }
                }
              ]
            };
          }
          
          // Default mock response
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    message: "This is a mock response from the OpenAI API. To use real AI responses, please provide a valid OPENAI_API_KEY in your .env file."
                  }),
                  role: "assistant"
                }
              }
            ]
          };
        }
      }
    }
  };
  
  return mockClient;
};

// Validate OpenAI API key format
const isValidOpenAIKey = (key) => {
  // Basic format validation (most OpenAI keys start with sk-)
  if (!key || typeof key !== 'string') return false;
  
  // Check for dummy/placeholder keys
  if (key === 'sk-your-api-key-here' || 
      key.startsWith('sk-dummy') || 
      key.includes('your-api-key') ||
      key.length < 20) {
    return false;
  }
  
  // Real OpenAI keys typically start with 'sk-'
  return key.startsWith('sk-');
};

// Initialize OpenAI - try to use API key if available, otherwise use mock
let openai;
const apiKey = process.env.OPENAI_API_KEY;

if (apiKey && isValidOpenAIKey(apiKey)) {
  try {
    console.log('Initializing OpenAI client with provided API key');
    openai = new OpenAI({ apiKey });
    
    // Add the API key to the client object for validation checks
    openai.apiKey = apiKey;
    
    // Test if the API key looks valid
    if (!apiKey.startsWith('sk-')) {
      console.warn('OpenAI API key has unusual format. Most OpenAI keys start with "sk-"');
    }
    
    console.log('OpenAI client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize OpenAI client with provided key:', error.message);
    console.log('Using mock OpenAI client instead');
    openai = createMockOpenAIClient();
  }
} else {
  if (!apiKey) {
    console.warn('No OpenAI API key provided, using mock client');
  } else {
    console.warn(`Invalid OpenAI API key format: "${apiKey.substring(0, 5)}..."`);
  }
  
  console.warn('CV parsing and AI features will not work with real data');
  console.warn('Please add a valid OPENAI_API_KEY to your .env file');
  console.warn('Valid OpenAI keys usually start with "sk-" and are about 51 characters long');
  
  openai = createMockOpenAIClient();
}

module.exports = openai; 