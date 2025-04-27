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
    const systemPrompt = `You are an AI assistant specialized in extracting professional experiences from medical CVs.`;
    
    let prompt = `Extract all professional experiences from the following CV text. For each experience, identify the following information:

1. Organization
2. Experience Type (e.g., clinical, research, volunteer, leadership)
3. Position Title
4. Start Date (MM/YYYY format)
5. End Date (MM/YYYY format, or "Current" if ongoing)
6. Country
7. State (if applicable)
8. Participation Frequency (e.g., full-time, part-time, weekly, monthly)
9. Setting (e.g., hospital, clinic, laboratory)
10. Primary Focus Area
11. Description of roles and responsibilities (maximum 750 characters)

Format the response as a JSON array, with each experience as an object with the above fields. If a field is not available, use null.

CV Text:
${cvText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    
    // Return the extracted experiences
    return parsedResponse.experiences || [];
  } catch (error) {
    console.error('Error extracting experiences:', error);
    throw new Error('Failed to extract experiences from CV');
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