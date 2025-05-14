const openai = require('../config/openai');

// Extract research products from CV text
const extractResearchProducts = async (cvText) => {
  try {
    if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
      throw new Error('Invalid CV text provided');
    }

    const systemPrompt = `You are an AI assistant specialized in extracting research publications, abstracts, presentations, and other research products from medical CVs. Your task is to carefully analyze the CV text and extract all research-related entries, including:
- Peer-reviewed publications
- Non-peer-reviewed publications
- Conference presentations (oral and poster)
- Abstracts
- Research projects
- Patents
- Book chapters
- Other research outputs

Be especially careful to identify and extract PubMed IDs (PMID) when present. Look for patterns like "PMID: 12345678" or similar formats.`;

    let prompt = `Please analyze the following CV text and extract all research products. For each research product, identify:

1. Title (required)
2. Type (choose one):
   - peer-reviewed
   - non-peer-reviewed
   - poster
   - oral
   - abstract
   - patent
   - book-chapter
   - other
3. Status (choose one):
   - published
   - submitted
   - accepted
   - in-progress
4. Authors (format: LastName FirstInitial MiddleInitial without periods or commas)
5. Journal name (if applicable)
6. Publication volume (if applicable)
7. Issue number (if applicable)
8. Pages (if applicable)
9. PMID (if applicable) - look for patterns like "PMID: 12345678"
10. Month published (if applicable)
11. Year published (if applicable)
12. Conference name (if applicable)
13. Conference location (if applicable)
14. Conference date (if applicable)

Important guidelines:
- Look for sections titled "Publications", "Research", "Presentations", etc.
- Extract all research products, even if some fields are missing
- If a research product is missing some details (e.g., journal, year), include it as long as it has a title and at least one author.
- For conference presentations, include the conference details
- For patents, include patent numbers if available
- For book chapters, include the book title and editors
- If no research products are found, return an empty array

IMPORTANT: Always return a single JSON object with a key 'researchProducts' (not an array of objects). Example: { "researchProducts": [ ... ] }
If no research products are found, return: { "researchProducts": [] }

Format the response as a JSON object with key "researchProducts". If a field is not available, use null.

CV Text:
${cvText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Try to parse the response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', content);
      return [];
    }

    // Handle both { researchProducts: [...] } and [ { researchProducts: [...] } ]
    if (Array.isArray(parsedResponse)) {
      const found = parsedResponse.find(obj => Array.isArray(obj.researchProducts));
      if (found) return found.researchProducts;
      return [];
    } else if (parsedResponse && Array.isArray(parsedResponse.researchProducts)) {
      return parsedResponse.researchProducts;
    }

    // Handle plain text response
    if (typeof content === 'string' && (content.toLowerCase().includes('no research products') || 
        content.toLowerCase().includes('does not contain any research products'))) {
      console.log('No research products found in CV');
      return [];
    }

    // If we get here, the response is unexpected
    console.error('Unexpected response format:', content);
    return [];
  } catch (error) {
    console.error('Error extracting research products:', error);
    return [];
  }
};

// Extract experiences from CV text
const extractExperiences = async (cvText) => {
  try {
    console.log('Starting experience extraction from CV');
    
    // Handle empty or invalid CV text
    if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
      console.error('Invalid or empty CV text provided');
      throw new Error('Invalid CV text provided');
    }
    
    // Log first 200 characters of CV for debugging
    console.log(`CV text first 200 chars: ${cvText.substring(0, 200)}...`);
    
    const systemPrompt = `You are an AI assistant specialized in extracting professional experiences from CVs and resumes. You can identify and extract work experiences, projects, education, and other professional activities from any field, not just medical.`;
    
    let prompt = `Extract all professional experiences and projects from the following CV text. 
    
For each experience or project, identify the following information:

1. Organization (company, institution, or project name)
2. Experience Type (choose the most appropriate: Employment, Internship, Research, Volunteering, Project, Education, or Other)
3. Position Title (job title or role)
4. Start Date (in MM/YYYY format if available, or just YYYY if only year is provided)
5. End Date (in MM/YYYY format, or "Present" if current)
6. Country (default to "United States" if not specified)
7. State (if applicable)
8. Participation Frequency (e.g., Full-time, Part-time, Contract)
9. Setting (e.g., Office, Remote, Laboratory, Field)
10. Primary Focus Area (e.g., Web Development, Data Science, UI/UX, Marketing)
11. Description (extract key responsibilities, achievements, and skills from the resume)

IMPORTANT: 
- Extract as many distinct experiences as you can find. Don't combine separate experiences.
- If any information is not explicitly provided, make a reasonable inference based on the context.
- For technical roles, include relevant technologies and tools mentioned.
- Return the response in the following JSON format: { "experiences": [ {experience1}, {experience2}, ... ] }
- If a field is not available and cannot be reasonably inferred, use null (not "Not specified").

CV Text:
${cvText}`;

    // Check if OpenAI API is configured
    if (!openai.apiKey && process.env.NODE_ENV !== 'test') {
      console.warn('OpenAI API key not configured. Using fallback experience extraction.');
      // Return sample experiences for testing/fallback
      return [
        {
          organization: "Sample Organization (OpenAI API not configured)",
          experienceType: "Employment",
          positionTitle: "Web Developer",
          startDate: "01/2022",
          endDate: "Present",
          country: "United States",
          state: "CA",
          participationFrequency: "Full-time",
          setting: "Remote",
          focusArea: "Web Development",
          description: "This is a sample experience because OpenAI API is not configured. Please add an API key to your .env file."
        }
      ];
    }

    try {
      console.log('Sending request to OpenAI API');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      console.log('OpenAI response received, length:', content.length);
      
      // Parse the JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
        console.log(`Successfully parsed response, found ${parsedResponse.experiences ? parsedResponse.experiences.length : 0} experiences`);
      } catch (parseError) {
        console.error('Error parsing JSON from OpenAI response:', parseError);
        console.log('Raw response content:', content);
        throw new Error('Failed to parse JSON response from OpenAI');
      }
      
      if (!parsedResponse || !parsedResponse.experiences || !Array.isArray(parsedResponse.experiences)) {
        console.error('Invalid response format from OpenAI', parsedResponse);
        throw new Error('OpenAI returned invalid format for experiences');
      }
      
      // Process the parsed experiences to ensure consistent field names
      const processedExperiences = parsedResponse.experiences.map(exp => {
        return {
          organization: exp.organization || null,
          experienceType: exp.experienceType || "Employment",
          positionTitle: exp.positionTitle || exp.title || exp.position || null,
          startDate: exp.startDate || null,
          endDate: exp.endDate || "Present",
          country: exp.country || "United States",
          state: exp.state || null,
          participationFrequency: exp.participationFrequency || "Full-time",
          setting: exp.setting || null,
          // Normalize the focus area field name for consistency with our database
          focusArea: exp.primaryFocusArea || exp.focusArea || null,
          description: exp.description || null
        };
      });
      
      console.log(`Returning ${processedExperiences.length} processed experiences`);
      return processedExperiences;
    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      // Check for common API errors
      if (apiError.message.includes('Unauthorized') || 
          apiError.message.includes('API key') || 
          apiError.message.includes('invalid_api_key') ||
          apiError.status === 401) {
        // For API key issues, provide a specific error with code for frontend handling
        const error = new Error('OpenAI API key is invalid or expired. Please check your API key configuration.');
        error.code = 'INVALID_API_KEY';
        throw error;
      } else if (apiError.message.includes('rate limit')) {
        const error = new Error('OpenAI API rate limit exceeded. Please try again later.');
        error.code = 'RATE_LIMIT_EXCEEDED';
        throw error;
      } else {
        throw new Error(`Failed to extract experiences: ${apiError.message}`);
      }
    }
  } catch (error) {
    console.error('Error extracting experiences:', error);
    // Pass through the error code if it exists
    if (error.code) {
      const newError = new Error(`Failed to extract experiences from CV: ${error.message}`);
      newError.code = error.code;
      throw newError;
    } else {
      throw new Error(`Failed to extract experiences from CV: ${error.message}`);
    }
  }
};

// Generate expanded description for meaningful experiences
const generateExpandedDescription = async (experience) => {
  try {
    const systemPrompt = `You are an AI assistant specialized in helping medical students highlight their most meaningful experiences for residency applications.`;
    
    let prompt = `Create an expanded description (maximum 300 characters) for a medical student's most meaningful experience. This expanded description should explain why this experience was particularly significant for their personal and professional growth, and how it contributes to their future medical career.

Experience details:
- Organization: ${experience.organization}
- Position: ${experience.positionTitle}
- Type: ${experience.experienceType}
- Original description: ${experience.description}

Your expanded description should:
1. Be concise (max 300 characters)
2. Highlight personal growth and insights gained
3. Connect the experience to their future goals in medicine
4. Be written in first person
5. Avoid simply repeating information from the original description`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 350
    });

    const expandedDescription = response.choices[0].message.content.trim();
    
    // Ensure the description is no longer than 300 characters
    return expandedDescription.length > 300 
      ? expandedDescription.substring(0, 297) + '...' 
      : expandedDescription;
  } catch (error) {
    console.error('Error generating expanded description:', error);
    throw new Error('Failed to generate expanded description');
  }
};

module.exports = {
  extractResearchProducts,
  extractExperiences,
  generateExpandedDescription
}; 