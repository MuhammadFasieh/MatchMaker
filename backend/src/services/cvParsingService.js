const openai = require('../config/openai');

// Extract research products from CV text
const extractResearchProducts = async (cvText) => {
  try {
    const systemPrompt = `You are an AI assistant specialized in extracting research publications, abstracts, presentations, and other research products from medical CVs.`;
    
    let prompt = `Extract all research products from the following CV text. For each research product, identify the following information:

1. Title
2. Type (choose one: peer-reviewed journal article/abstract, non-peer-reviewed journal article/abstract, poster presentation, oral presentation)
3. Status (choose one: published, submitted, accepted)
4. Complete authors list (format: LastName FirstInitial MiddleInitial without periods or commas)
5. Journal name (if applicable)
6. Publication volume (if applicable)
7. Issue number (if applicable)
8. Pages (if applicable)
9. PMID (if applicable)
10. Month published (if applicable)
11. Year published (if applicable)

Format the response as a JSON array, with each research product as an object with the above fields. If a field is not available, use null.

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
    
    // Return the extracted research products
    return parsedResponse.researchProducts || [];
  } catch (error) {
    console.error('Error extracting research products:', error);
    throw new Error('Failed to extract research products from CV');
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