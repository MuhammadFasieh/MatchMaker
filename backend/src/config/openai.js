const OpenAI = require('openai');
require('dotenv').config();

// Create a mock OpenAI client for development without an API key
const createMockOpenAIClient = () => {
  return {
    chat: {
      completions: {
        create: async ({ model, messages }) => {
          console.log('Using mock OpenAI client with messages:', messages);
          
          // Return a mock response
          return {
            choices: [
              {
                message: {
                  content: "This is a mock response from the OpenAI API. To use real AI responses, please provide an OPENAI_API_KEY in your .env file.",
                  role: "assistant"
                }
              }
            ]
          };
        }
      }
    }
  };
};

// Initialize OpenAI - try to use API key if available, otherwise use mock
let openai;
const apiKey = process.env.OPENAI_API_KEY;

if (apiKey && apiKey !== 'sk-your-api-key-here') {
  try {
    console.log('Initializing OpenAI client with provided API key');
    openai = new OpenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize OpenAI client with provided key:', error.message);
    console.log('Using mock OpenAI client instead');
    openai = createMockOpenAIClient();
  }
} else {
  console.warn('No OpenAI API key provided, using mock client for development');
  openai = createMockOpenAIClient();
}

module.exports = openai; 