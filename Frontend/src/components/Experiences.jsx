import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { experiences as experiencesAPI } from '../services/api';
import { openai as openaiAPI } from '../services/api';
import axios from 'axios';

// Import API_URL from services/api
import { API_URL } from '../services/api';

function CVUploadExperienceExtractor({ onExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setExtracted(null);
    setShowApiKeyAlert(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    setLoading(true);
    setError('');
    setExtracted(null);
    setShowApiKeyAlert(false);
    
    try {
      const formData = new FormData();
      formData.append('cv', file);
      
      console.log(`Uploading CV file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Use the API_URL from the services/api file
      const res = await axios.post(`${API_URL}/cv/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      console.log('CV upload response:', res.data);
      
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        console.log(`Successfully extracted ${res.data.data.length} experiences`);
        setExtracted(res.data.data);
        if (onExtracted) onExtracted(res.data.data);
      } else if (res.data.success && (!res.data.data || res.data.data.length === 0)) {
        setError('No experiences found in the uploaded CV. Please try a different file or enter your experiences manually.');
      } else {
        setError(res.data.message || 'Failed to extract experience data from CV.');
      }
    } catch (err) {
      console.error('Error uploading CV:', err);
      
      // Check for specific error types from the backend
      if (err.response?.data?.errorCode === 'INVALID_API_KEY') {
        console.error('Invalid OpenAI API key error detected');
        setShowApiKeyAlert(true);
        setError('OpenAI API key is invalid or expired. The system will use placeholder data instead.');
      } else if (err.response?.data?.errorCode === 'RATE_LIMIT_EXCEEDED') {
        setError('AI service rate limit exceeded. Please try again later or enter your experiences manually.');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Error uploading or parsing CV.';
        setError(errorMsg);
        
        // Check for OpenAI-specific errors in the message
        if (errorMsg.toLowerCase().includes('openai') || 
            errorMsg.toLowerCase().includes('api key')) {
          setShowApiKeyAlert(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h3>Upload CV to Extract Experience</h3>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Extracting...' : 'Extract Experience'}
      </button>
      
      {/* API Key Alert */}
      {showApiKeyAlert && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '12px', 
          border: '1px solid #ffeeba', 
          borderRadius: '4px', 
          marginTop: '16px',
          marginBottom: '16px'
        }}>
          <strong>OpenAI API Key Issue</strong>
          <p>The server's OpenAI API key is invalid or expired. Please contact the administrator to update the API key.</p>
          <p>You can still use the application with placeholder data or manually enter your experiences.</p>
        </div>
      )}
      
      {error && !showApiKeyAlert && (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      )}
      
      {extracted && extracted.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Extracted Experience:</h4>
          <ol>
            {extracted.map((exp, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <b>{exp.positionTitle || 'Position not found'}</b> at <b>{exp.organization || 'Organization not found'}</b><br />
                {exp.startDate} - {exp.endDate || 'Current'}<br />
                {exp.country} {exp.state && `, ${exp.state}`}<br />
                <i>{exp.contextRolesResponsibilities}</i>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function CombinedExperienceComponents() {

  const [stage, setStage] = useState('upload'); 
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState({
    organization: 'Not specified',
    experienceType: 'Not specified',
    positionTitle: 'Not specified',
    startDate: 'Not specified',
    endDate: 'Not specified',
    current: false,
    country: 'Not specified',
    state: 'Not specified',
    participationFrequency: 'Not specified',
    setting: 'Not specified',
    primaryFocusArea: 'Not specified',
    description: 'Not specified'
  });
  const [experiences, setExperiences] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const fileInputRef = useRef(null);

  // Medical Experiences State
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [expansionNotes, setExpansionNotes] = useState(
    '"Highlight research contribution and personal growth"\n"Emphasize my exposure to emergency medicine and decision-making"\n"Show how this work impacted my view on service and leadership"'
  );
  const [charCount, setCharCount] = useState(231);
  const [formSubmitted, setFormSubmitted] = useState(false);
  // Add state for saved experiences
  const [savedExperiences, setSavedExperiences] = useState([]);
  // Add state for AI-enhanced experiences
  const [enhancedExperiences, setEnhancedExperiences] = useState([]);
  // Add state for loading indicator during AI enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);
  // Add state for AI checkbox
  const [useAI, setUseAI] = useState(true);
  // Add state for when insights are generated
  const [insightsGenerated, setInsightsGenerated] = useState(false);

  const medicalExperiences = [
    {
      id: 'mayo',
      label: 'Mayo Clinic – Research Intern',
      description: 'Working on oncology research sharpened my technical skills in genetics and strengthened my scientific curiosity. This experience confirmed my passion for clinical research and my desire to contribute to medical innovation.'
    },
    {
      id: 'mgh',
      label: 'Massachusetts General Hospital – Clinical Shadowing',
      description: 'Shadowing emergency physicians exposed me to high-pressure medical decision-making. It reinforced my interest in fast-paced clinical environments and inspired me to pursue a career in emergency medicine.'
    },
    {
      id: 'habitat',
      label: 'Habitat for Humanity – Volunteer',
      description: 'Volunteering taught me the power of community support and leadership. Organizing outreach events deepened my empathy and commitment to serving underserved populations through medicine.'
    }
  ];

  const parseCV = async (file) => {
    try {
      // First try to use the parseCV API endpoint that also stores in MongoDB
      // Only try this if we don't want to rely on local parsing
      /* 
      const response = await experiencesAPI.parseCV(file);
      
      if (response && response.experiences && response.experiences.length > 0) {
        setExperiences(response.experiences);
        setTotalPages(response.experiences.length);
        setCurrentPage(1);
        setFormData(response.experiences[0]);
        return true;
      }
      */
      
      // Since the API endpoint is not available, always use local parsing
    } catch (error) {
      console.error('Error using API to parse CV:', error);
      // Fall back to local parsing if API fails
    }
    
    // Local parsing as fallback (or primary method)
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target.result;
        
        const parsedData = [];
        
        const experienceMatch = text.match(/experience|employment|work/i);
        const educationMatch = text.match(/education|degree|university/i);
        
        if (experienceMatch) {
          let expData = {
            organization: extractOrganization(text) || 'Not specified',
            experienceType: determineExperienceType(text) || 'Not specified',
            positionTitle: extractPosition(text) || 'Not specified',
            startDate: extractDates(text).start || 'Not specified',
            endDate: extractDates(text).end || 'Not specified',
            current: isCurrentPosition(text),
            country: extractLocation(text).country || 'Not specified',
            state: extractLocation(text).state || 'Not specified',
            participationFrequency: determineFrequency(text) || 'Not specified',
            setting: determineSetting(text) || 'Not specified',
            primaryFocusArea: extractFocusArea(text) || 'Not specified',
            description: extractDescription(text) || 'Not specified'
          };
          parsedData.push(expData);
        }
        
        if (educationMatch) {
          let eduData = {
            organization: extractEducationInstitution(text) || 'Not specified',
            experienceType: 'Education',
            positionTitle: extractDegree(text) || 'Not specified',
            startDate: extractDates(text).start || 'Not specified',
            endDate: extractDates(text).end || 'Not specified',
            current: isCurrentPosition(text),
            country: extractLocation(text).country || 'Not specified',
            state: extractLocation(text).state || 'Not specified',
            participationFrequency: 'Full-time',
            setting: 'Academic',
            primaryFocusArea: extractMajor(text) || 'Not specified',
            description: 'Not specified'
          };
          parsedData.push(eduData);
        }
        
        if (parsedData.length === 0) {
          parsedData.push({...formData});
        }
        
        resolve(parsedData);
      };
      
      reader.readAsText(file);
    });
  };
  
  const extractOrganization = (text) => {
    const matches = text.match(/(?:worked at|employed by|organization:?)\s+([A-Za-z0-9\s&]+)/i);
    return matches ? matches[1].trim() : null;
  };
  
  const determineExperienceType = (text) => {
    if (text.match(/clinic|hospital|patient|medical/i)) return 'Clinical';
    if (text.match(/research|study|experiment|data/i)) return 'Research';
    if (text.match(/teach|instruct|professor|lecture/i)) return 'Teaching';
    return 'Professional';
  };
  
  const extractPosition = (text) => {
    const matches = text.match(/(?:position:?|title:?|as a|as an)\s+([A-Za-z\s]+)/i);
    return matches ? matches[1].trim() : null;
  };
  
  const extractDates = (text) => {
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthPattern = monthNames.join('|');
    
    const startMatch = text.match(new RegExp(`(${monthPattern})\\s+\\d{4}`, 'i'));
    const endMatch = text.match(new RegExp(`to\\s+(${monthPattern})\\s+\\d{4}`, 'i'));
    
    return {
      start: startMatch ? startMatch[0] : null,
      end: endMatch ? endMatch[1] + endMatch[0].match(/\d{4}/)[0] : null
    };
  };
  
  const isCurrentPosition = (text) => {
    return text.match(/present|current|ongoing|now/i) !== null;
  };
  
  const extractLocation = (text) => {
    const stateAbbr = '(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)';
    const stateMatch = text.match(new RegExp(`\\b${stateAbbr}\\b`, 'i'));
    
    const countryMatch = text.match(/\b(?:USA|United States|Canada|UK|United Kingdom)\b/i);
    
    return {
      state: stateMatch ? stateMatch[0] : null,
      country: countryMatch ? countryMatch[0] : null
    };
  };
  
  const determineFrequency = (text) => {
    if (text.match(/daily|every day/i)) return 'Daily';
    if (text.match(/weekly|every week/i)) return 'Weekly';
    if (text.match(/monthly|every month/i)) return 'Monthly';
    if (text.match(/quarterly|every quarter/i)) return 'Quarterly';
    return 'Full-time';
  };
  
  const determineSetting = (text) => {
    if (text.match(/hospital|clinic|medical center/i)) return 'Hospital';
    if (text.match(/lab|laboratory/i)) return 'Laboratory';
    if (text.match(/university|college|school/i)) return 'Academic';
    if (text.match(/remote|virtual|online/i)) return 'Remote';
    return 'Office';
  };
  
  const extractFocusArea = (text) => {
    if (text.match(/emergency|ER|urgent/i)) return 'Emergency Medicine';
    if (text.match(/cardio|heart|cardiac/i)) return 'Cardiology';
    if (text.match(/neuro|brain|nervous/i)) return 'Neurology';
    if (text.match(/software|programming|development|code/i)) return 'Software Development';
    if (text.match(/data|analytics|statistics/i)) return 'Data Science';
    return null;
  };
  
  const extractDescription = (text) => {
    const matches = text.match(/(?:responsibilities|duties|tasks|role included)[:.]?\s+([^.]+\.)/i);
    return matches ? matches[1].trim() : null;
  };
  
  const extractEducationInstitution = (text) => {
    const matches = text.match(/(?:university|college|school|institute) of ([A-Za-z\s&]+)/i);
    return matches ? matches[0].trim() : null;
  };
  
  const extractDegree = (text) => {
    const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'bs', 'ba', 'ms', 'ma', 'mba'];
    const degreePattern = degrees.join('|');
    const matches = text.match(new RegExp(`(${degreePattern})(?:\\s+of|\\s+in)?\\s+([A-Za-z\\s&]+)`, 'i'));
    return matches ? matches[0].trim() : null;
  };
  
  const extractMajor = (text) => {
    const majors = ['computer science', 'engineering', 'medicine', 'biology', 'chemistry', 'physics', 'mathematics', 'business', 'economics'];
    const majorPattern = majors.join('|');
    const matches = text.match(new RegExp(`(${majorPattern})`, 'i'));
    return matches ? matches[0].trim() : null;
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid file (PDF, DOC, DOCX, TXT, or RTF)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);
    setStage('analyzing');
    
    // Start progress animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProgress(Math.min(progress, 90)); // Cap at 90% until complete
      if (progress >= 90) clearInterval(interval);
    }, 100);

    try {
      console.log(`Uploading CV file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // First try using the API endpoint for CV parsing
      const formData = new FormData();
      formData.append('cv', file);
      
      // Use the API for CV parsing with authentication
      const response = await axios.post(`${API_URL}/cv/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      console.log('CV upload API response:', response.data);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // API successfully extracted experiences
        const extractedExperiences = response.data.data;
        console.log(`API extracted ${extractedExperiences.length} experiences`);
        
        // Check if these are mock/fallback experiences from an API key issue
        if (extractedExperiences.some(exp => 
          exp.organization?.includes('API key') || 
          exp.organization?.includes('Mock Organization') ||
          exp.description?.includes('API key')
        )) {
          console.warn('Detected fallback/mock experiences due to API key issues');
          handleApiKeyError();
        }
        
        // MODIFIED: Don't save to MongoDB yet, just set local state
        // Format the extracted experiences and display them for review
        const formattedExperiences = extractedExperiences.map(exp => {
          // Add a temporary ID until saved
          exp.tempId = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
          
          // Format dates and set current flag if endDate is Present
          if (exp.endDate === 'Present' || exp.isCurrent) {
            exp.current = true;
            exp.endDate = 'Present';
          }
          
          return exp;
        });
        
        setExperiences(formattedExperiences);
        setTotalPages(formattedExperiences.length);
        setFormData(formattedExperiences[0]);
        
        // Set current page and finish loading
        setCurrentPage(1);
        clearInterval(interval);
        setProgress(100);
        
        // Wait a moment to show 100% before transitioning
        setTimeout(() => {
          setStage('form');
        }, 500);
      } else {
        // If API extraction failed, fall back to local parsing
        console.log('API extraction failed or returned no experiences, falling back to local parsing');
        const parsed = await parseCV(file);
        
        if (parsed && parsed.length > 0) {
          // MODIFIED: Don't save to MongoDB yet, just set local state
          // Format the locally parsed experiences 
          const formattedExperiences = parsed.map(exp => {
            // Add a temporary ID until saved
            exp.tempId = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            
            // Format dates and set current flag if endDate is Present
            if (exp.endDate === 'Present' || exp.isCurrent) {
              exp.current = true;
              exp.endDate = 'Present';
            }
            
            return exp;
          });
          
          setExperiences(formattedExperiences);
          setTotalPages(formattedExperiences.length);
          setFormData(formattedExperiences[0]);
          setCurrentPage(1);
          clearInterval(interval);
          setProgress(100);
          
          setTimeout(() => {
            setStage('form');
          }, 500);
        } else {
          throw new Error('No experiences found in CV');
        }
      }
    } catch (error) {
      console.error('Error processing CV:', error);
      clearInterval(interval);
      
      // Handle API key errors with specific messages
      if (error.response?.data?.errorCode === 'INVALID_API_KEY') {
        handleApiKeyError();
        alert('The server\'s OpenAI API key is invalid or expired. Please contact the administrator to update the API key. You can still manually enter your experiences.');
      } else if (error.response?.data?.errorCode === 'RATE_LIMIT_EXCEEDED') {
        alert('AI service rate limit exceeded. Please try again later or enter your experiences manually.');
      } else if (
        error.response?.data?.message?.toLowerCase().includes('openai') || 
        error.response?.data?.message?.toLowerCase().includes('api key')
      ) {
        handleApiKeyError();
        alert('AI processing service is unavailable. Please try again later or manually enter your experiences.');
      } else {
        alert('Failed to parse CV. Please try again or manually enter your experiences.');
      }
      
      setStage('upload');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      let updated = { ...prev, [field]: value };
      
      // Special handling for the "current" checkbox
      if (field === 'current') {
        if (value === true) {
          // When current is checked, set endDate to "Present"
          updated.endDate = "Present";
        } else if (updated.endDate === "Present") {
          // When unchecking current that had "Present", clear the end date
          updated.endDate = "";
        }
      }
      
      // If setting endDate to "Present", ensure current is checked
      if (field === 'endDate' && value === "Present") {
        updated.current = true;
      }
      
      const updatedExperiences = [...experiences];
      updatedExperiences[currentPage - 1] = updated;
      setExperiences(updatedExperiences);
      
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Make sure experiences exist and current page is valid
      if (!experiences || experiences.length === 0 || currentPage < 1 || currentPage > experiences.length) {
        throw new Error('No valid experience data to save');
      }
      
      // Update the current experience in the local state
          const updatedExperiences = [...experiences];
      updatedExperiences[currentPage - 1] = { ...formData };
          setExperiences(updatedExperiences);
        
      // Also update the savedExperiences state for the meaningful experiences section
      setSavedExperiences(updatedExperiences);
      
      // Show success message
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience. Please try again.');
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current.click();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // Get the experience and make sure current is set properly
      const prevExp = {...experiences[newPage - 1]};
      if (prevExp.endDate === "Present") {
        prevExp.current = true;
      }
      setFormData(prevExp);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Get the experience and make sure current is set properly
      const nextExp = {...experiences[newPage - 1]};
      if (nextExp.endDate === "Present") {
        nextExp.current = true;
      }
      setFormData(nextExp);
    }
  };

  const handleExperienceToggle = (id) => {
    // Convert id to string to ensure consistent comparison
    const idStr = String(id);
    
    // Check if this ID is already in the selected experiences
    const isSelected = selectedExperiences.some(selectedId => String(selectedId) === idStr);
    
    if (isSelected) {
      // Remove from selected experiences
      setSelectedExperiences(selectedExperiences.filter(selectedId => String(selectedId) !== idStr));
    } else {
      // Add to selected experiences if less than 3 are selected
      if (selectedExperiences.length < 3) {
        setSelectedExperiences([...selectedExperiences, id]);
      }
    }
    
    console.log(`Toggled experience ${id}, now selected: ${!isSelected}`);
  };

  const handleTextAreaChange = (e) => {
    const text = e.target.value;
    setExpansionNotes(text);
    setCharCount(text.length);
  };

  const handleSaveMedicalExperiences = async () => {
    try {
      setIsEnhancing(false);
      
      // Create a reference to the meaningful experiences
      const medicalFormData = {
        selectedExperiences,
        expansionNotes
      };
      
      console.log('Medical experiences selected:', medicalFormData);
      
      // If AI is not checked, save immediately
      if (!useAI) {
        await saveAllExperiences();
      } else {
        // Otherwise, generate insights first
        await generateAIInsights();
      }
            } catch (error) {
      console.error('Error processing meaningful experiences:', error);
      alert('Failed to process experiences. Please try again.');
      setIsEnhancing(false);
    }
  };
  
  // New function to handle saving all experiences
  const saveAllExperiences = async () => {
    try {
      // First save all experiences to MongoDB
      const experiencesToSave = experiences.map(exp => {
        const cleanExp = { ...exp };
        delete cleanExp.tempId;
        
        if (cleanExp._id && cleanExp._id.toString().startsWith('temp_')) {
          delete cleanExp._id;
        }
        
        return cleanExp;
      });
      
      // Save all experiences to MongoDB
      const result = await experiencesAPI.saveMultiple(experiencesToSave);
      
      if (result && result.experiences && result.experiences.length > 0) {
        // Update local experiences with the saved ones (with their MongoDB IDs)
        setExperiences(result.experiences);
        setSavedExperiences(result.experiences);
        
        // Update the form data with the current page's experience
        if (currentPage <= result.experiences.length) {
          setFormData(result.experiences[currentPage - 1]);
        }
        
        console.log('All experiences saved to MongoDB:', result.experiences);
        
        // Now explicitly mark selected experiences as meaningful using dedicated endpoint
        for (const selectedId of selectedExperiences) {
          // Find the corresponding saved experience with real MongoDB ID
          const savedExp = result.experiences.find(exp => {
            // If selectedId is from a previously saved experience, it will match _id
            if (String(exp._id) === String(selectedId)) {
              return true;
            }
            
            // If selectedId is from a temporary ID, try to match by organization and position
            const tempExp = experiences.find(e => 
              (e._id === selectedId || e.tempId === selectedId) && 
              e.organization === exp.organization && 
              e.positionTitle === exp.positionTitle
            );
            return !!tempExp;
          });
          
          if (savedExp && savedExp._id) {
            console.log(`Explicitly marking experience as meaningful: ${savedExp._id} (${savedExp.organization})`);
            try {
              // Make a direct API call to mark this experience as meaningful
              await experiencesAPI.markMostMeaningful(savedExp._id);
            } catch (markError) {
              console.error(`Failed to mark experience ${savedExp._id} as meaningful:`, markError);
            }
          }
        }
      }
      
      // Show success message
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      setFormSubmitted(true);
      
    } catch (error) {
      console.error('Error saving experiences:', error);
      alert('Failed to save experiences. Please try again.');
    }
  };
  
  // New function to generate AI insights
  const generateAIInsights = async () => {
    try {
      setIsEnhancing(true);
      
      // First save all experiences to MongoDB to ensure they have IDs
      const experiencesToSave = experiences.map(exp => {
        const cleanExp = { ...exp };
        delete cleanExp.tempId;
        
        if (cleanExp._id && cleanExp._id.toString().startsWith('temp_')) {
          delete cleanExp._id;
        }
        
        return cleanExp;
      });
      
      // Save all experiences to MongoDB
      const result = await experiencesAPI.saveMultiple(experiencesToSave);
      
      if (result && result.experiences && result.experiences.length > 0) {
        // Update local experiences with the saved ones (with their MongoDB IDs)
        setExperiences(result.experiences);
        setSavedExperiences(result.experiences);
        
        // Mark selected experiences as meaningful
        for (const selectedId of selectedExperiences) {
          // Find the corresponding saved experience with real MongoDB ID
          const savedExp = result.experiences.find(exp => {
            // If selectedId is from a previously saved experience, it will match _id
            if (String(exp._id) === String(selectedId)) {
              return true;
            }
            
            // If selectedId is from a temporary ID, try to match by organization and position
            const tempExp = experiences.find(e => 
              (e._id === selectedId || e.tempId === selectedId) && 
              e.organization === exp.organization && 
              e.positionTitle === exp.positionTitle
            );
            return !!tempExp;
          });
          
          if (savedExp && savedExp._id) {
            console.log(`Explicitly marking experience as meaningful: ${savedExp._id} (${savedExp.organization})`);
            try {
              // Make a direct API call to mark this experience as meaningful
              await experiencesAPI.markMostMeaningful(savedExp._id);
            } catch (markError) {
              console.error(`Failed to mark experience ${savedExp._id} as meaningful:`, markError);
            }
          }
        }
        
        // Fetch the experiences again to make sure we have the updated isMostMeaningful flags
        try {
          const updatedExperiences = await experiencesAPI.getAll();
          if (updatedExperiences && updatedExperiences.length > 0) {
            setExperiences(updatedExperiences);
            setSavedExperiences(updatedExperiences);
            
            // Check which experiences are now marked as meaningful
            const meaningful = updatedExperiences.filter(exp => exp.isMostMeaningful);
            console.log('Experiences now marked as most meaningful:', meaningful);
            
            // Generate AI-powered insights for the meaningful experiences if there are expansion notes
            if (meaningful.length > 0 && expansionNotes.trim()) {
              try {
                // Generate AI-powered insights for the meaningful experiences
                const enhancementResult = await openaiAPI.enhanceExperiences(
                  meaningful,
                  expansionNotes
                );
                
                if (enhancementResult && enhancementResult.enhancedExperiences) {
                  console.log('AI enhanced experiences:', enhancementResult.enhancedExperiences);
                  setEnhancedExperiences(enhancementResult.enhancedExperiences);
                  
                  // Save the enhanced descriptions back to the experiences
                  for (const enhanced of enhancementResult.enhancedExperiences) {
                    if (enhanced._id && enhanced.expandedDescription) {
                      try {
                        await experiencesAPI.update(enhanced._id, {
                          expandedDescription: enhanced.expandedDescription
                        });
                      } catch (updateError) {
                        console.error(`Failed to save enhanced description for ${enhanced._id}:`, updateError);
                      }
                    }
                  }
                  
                  // Set flag that insights were generated
                  setInsightsGenerated(true);
                  setFormSubmitted(true);
                }
              } catch (enhanceError) {
                console.error('Error generating AI insights:', enhanceError);
                // If AI fails, still show the form as submitted but without AI content
                setFormSubmitted(true);
              }
            } else {
              // If no expansion notes, clear any previous enhanced experiences
              setEnhancedExperiences([]);
              setFormSubmitted(true);
            }
          }
        } catch (fetchError) {
          console.error('Error fetching updated experiences:', fetchError);
          setFormSubmitted(true);
        }
      }
      
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    if (experiences.length > 0 && currentPage <= experiences.length) {
      // Update formData and explicitly set current flag based on endDate
      const currentExp = experiences[currentPage - 1];
      if (currentExp.endDate === "Present") {
        currentExp.current = true;
      }
      setFormData(currentExp);
    }
  }, [currentPage, experiences]);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const response = await experiencesAPI.getAll();
        
        if (response && response.length > 0) {
          // Format dates and handle current flag for loaded experiences
          const formattedExperiences = response.map(exp => {
            // Format dates similar to handleExtractedExperience
            let startDateFormatted = exp.startDate;
            let endDateFormatted = exp.endDate;
            let isCurrent = exp.isCurrent || false;
            
            // Set current flag and endDate to Present if applicable
            if (endDateFormatted && typeof endDateFormatted === 'string' && 
                endDateFormatted.toLowerCase() === 'present') {
              isCurrent = true;
            }

            // Format startDate if it's in ISO format
            if (startDateFormatted && startDateFormatted.includes('T')) {
              const date = new Date(startDateFormatted);
              if (!isNaN(date.getTime())) {
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const year = date.getFullYear();
                startDateFormatted = `${month}/${day}/${year}`;
              }
            }
            
            // Format endDate if it's in ISO format and not current
            if (endDateFormatted && endDateFormatted.includes('T') && !isCurrent) {
              const date = new Date(endDateFormatted);
              if (!isNaN(date.getTime())) {
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const year = date.getFullYear();
                endDateFormatted = `${month}/${day}/${year}`;
              }
            } else if (isCurrent) {
              endDateFormatted = 'Present';
            }
            
            // Return with current explicitly set to true if endDate is Present
            return {
              ...exp,
              startDate: startDateFormatted,
              endDate: endDateFormatted,
              current: isCurrent || endDateFormatted === 'Present'
            };
          });
          
          // Ensure the first experience has current set correctly before setting form data
          if (formattedExperiences[0] && formattedExperiences[0].endDate === 'Present') {
            formattedExperiences[0].current = true;
          }
          
          setExperiences(formattedExperiences);
          // Also set saved experiences for the meaningful experiences section
          setSavedExperiences(formattedExperiences);
          
          // Check for any experiences already marked as most meaningful
          const meaningfulExperiences = formattedExperiences.filter(exp => exp.isMostMeaningful);
          if (meaningfulExperiences.length > 0) {
            // Set the selected experiences based on what was previously marked
            setSelectedExperiences(meaningfulExperiences.map(exp => exp._id));
            setFormSubmitted(true); // Show the selected experiences section
          }
          
          setTotalPages(formattedExperiences.length);
          setFormData(formattedExperiences[0]);
          setCurrentPage(1);
          setStage('form');
        }
      } catch (error) {
        console.error('Error loading experiences:', error);
      }
    };
    
    loadExperiences();
  }, []);

  const handleReuploadCV = () => {
    setStage('upload');
  };

  // Add the handleExtractedExperience function
  const handleExtractedExperience = (extractedExperiences) => {
    if (Array.isArray(extractedExperiences) && extractedExperiences.length > 0) {
      console.log("Extracted experiences:", extractedExperiences);
      
      // Map the extracted experiences to the format expected by the form
      const formattedExperiences = extractedExperiences.map(exp => {
        // Format date handling and current flag
        let startDateFormatted = exp.startDate;
        let endDateFormatted = exp.endDate;
        let isCurrent = exp.isCurrent || false;
        
        // Check if endDate is "Present" to set current flag
        if (exp.endDate && typeof exp.endDate === 'string' && 
           (exp.endDate.toLowerCase() === 'present' || 
            exp.endDate.toLowerCase() === 'current' || 
            exp.endDate.toLowerCase() === 'now')) {
          isCurrent = true;
          endDateFormatted = 'Present';
        } else if (exp.isCurrent) {
          isCurrent = true;
          endDateFormatted = 'Present';
        }
        
        // Format startDate if it's in ISO format (from API)
        if (startDateFormatted && startDateFormatted.includes('T')) {
          const date = new Date(startDateFormatted);
          if (!isNaN(date.getTime())) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            startDateFormatted = `${month}/${day}/${year}`;
          }
        }
        
        // Format endDate if it's in ISO format and not "Present"
        if (endDateFormatted && endDateFormatted.includes('T') && !isCurrent) {
          const date = new Date(endDateFormatted);
          if (!isNaN(date.getTime())) {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            endDateFormatted = `${month}/${day}/${year}`;
          }
        }
        
        // Always ensure current is true when endDate is Present
        if (endDateFormatted === 'Present') {
          isCurrent = true;
        }
        
        // Add console log to debug current flag
        console.log(`Experience: ${exp.organization}, endDate: ${endDateFormatted}, isCurrent: ${isCurrent}`);
        
        return {
          organization: exp.organization || 'Not specified',
          experienceType: exp.experienceType || 'Not specified',
          positionTitle: exp.positionTitle || 'Not specified',
          startDate: startDateFormatted || 'Not specified',
          endDate: endDateFormatted || 'Not specified',
          current: isCurrent, // Set current checkbox based on endDate/isCurrent
          country: exp.country || 'Not specified',
          state: exp.state || 'Not specified',
          participationFrequency: exp.participationFrequency || 'Not specified',
          setting: exp.setting || 'Not specified',
          primaryFocusArea: exp.primaryFocusArea || exp.focusArea || 'Not specified',
          description: exp.description || exp.contextRolesResponsibilities || 'Not specified'
        };
      });
      
      // Update state
      setExperiences(formattedExperiences);
      setTotalPages(formattedExperiences.length);
      setCurrentPage(1);
      
      // Ensure current flag is explicitly set before setting formData
      if (formattedExperiences[0] && formattedExperiences[0].endDate === 'Present') {
        formattedExperiences[0].current = true;
      }
      
      setFormData(formattedExperiences[0]);
      setStage('form');
      setFileName('Extracted from CV');
    } else {
      console.warn("No experiences found in the extracted data");
    }
  };

  // API Key Alert Component
  const ApiKeyAlert = () => (
    <div style={{ 
      backgroundColor: '#fff3cd', 
      color: '#856404', 
      padding: '12px', 
      border: '1px solid #ffeeba', 
      borderRadius: '4px', 
      marginBottom: '20px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
          <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#856404"/>
        </svg>
        <strong>OpenAI API Key Issue</strong>
      </div>
      <p>The server's OpenAI API key is invalid or expired. Please contact the administrator to update the API key.</p>
      <p>You can still use the application with placeholder data or manually enter your experiences.</p>
    </div>
  );

  // Function to handle an API key error
  const handleApiKeyError = () => {
    setShowApiKeyAlert(true);
    // Show the alert for 30 seconds then hide it
    setTimeout(() => {
      setShowApiKeyAlert(false);
    }, 30000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className='text-center text-[36px] pt-[1rem] text-[#197EAB] font-semibold'>Experiences</h1>
      
      {/* Show API Key Alert if needed */}
      {showApiKeyAlert && <ApiKeyAlert />}
      
      {/* Add the CV Upload component */}
      <div className="my-4">
        <CVUploadExperienceExtractor onExtracted={handleExtractedExperience} />
      </div>
      
      {/* Existing upload stage */}
      {stage === 'upload' && (
        <div className="text-center bg-white p-10 rounded-3xl shadow-lg my-[4rem]">
          <h1 className="text-3xl font-semibold text-[#197EAB] mb-6">Upload Your CV</h1>
          
          <p className="text-gray-600 mb-8">
            Please upload your CV here. Make sure it includes all of your research products
            (publications, abstracts, presentations, etc.) along with their citation.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4">
            <div className="flex flex-col items-center justify-center">
              <Upload size={36} className="text-gray-400 mb-2" />
              <h2 className="text-lg font-medium text-gray-700 mb-2">Upload Your CV</h2>
              <p className="text-gray-500 mb-4">Accepted file formats: .pdf, .doc, .docx, .txt, .rtf</p>
              
              <button 
                onClick={handleBrowseFiles}
                className="bg-[#197EAB] text-white py-2 px-6 rounded cursor-pointer"
              >
                Browse Files
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".pdf,.doc,.docx,.txt,.rtf"
                className="hidden"
              />
            </div>
          </div>
          
          <p className="text-gray-500">Max size: 10MB</p>
        </div>
      )}

      {/* Analyzing Stage */}
      {stage === 'analyzing' && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative w-25 h-24 mb-8">
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#4d7cba"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - progress / 100)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.min(progress, 100)}%</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Analyzing your CV...</h2>
          <p className="text-gray-600">extracting your research products</p>
        </div>
      )}

      {/* Form Stage */}
      {stage === 'form' && (
        <div className='flex flex-col justify-center my-[3.5rem]'>
          {/* CV Experience Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-12">
            <div className="border-b border-gray-200 py-3 px-6">
              <h2 className="text-xl text-[#197EAB] font-semibold">Experience #{currentPage}</h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="mb-1 font-medium">Uploaded File: {fileName}</p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleFormChange('organization', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Experience Type</label>
                  <div className="relative">
                    <select
                      value={formData.experienceType}
                      onChange={(e) => handleFormChange('experienceType', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 appearance-none pr-8"
                    >
                      <option value="Not specified">Not specified</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Research">Research</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Professional">Professional</option>
                      <option value="Education">Education</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                      <ChevronLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Position Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.positionTitle}
                      onChange={(e) => handleFormChange('positionTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Start Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => handleFormChange('startDate', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      <Calendar size={16} />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Country</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium">End Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.endDate}
                      onChange={(e) => handleFormChange('endDate', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      <Calendar size={16} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.current}
                        onChange={(e) => handleFormChange('current', e.target.checked)}
                        className="mr-2"
                      />
                      <span>Current</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-1 font-medium">State</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Participation Frequency</label>
                  <div className="relative">
                    <select
                      value={formData.participationFrequency}
                      onChange={(e) => handleFormChange('participationFrequency', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 appearance-none pr-8"
                    >
                      <option value="Not specified">Not specified</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                      <ChevronLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Setting</label>
                  <div className="relative">
                    <select
                      value={formData.setting}
                      onChange={(e) => handleFormChange('setting', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 appearance-none pr-8"
                    >
                      <option value="Not specified">Not specified</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Academic">Academic</option>
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                      <ChevronLeft size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Primary Focus Area</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.primaryFocusArea}
                    onChange={(e) => handleFormChange('primaryFocusArea', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-1 font-medium">Context, Roles, Responsibilities</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                ></textarea>
                <div className="text-right text-gray-500 text-sm mt-1">
                  {formData.description.length} / 300
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="mx-2">
                    {currentPage} of {totalPages} Results
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <button
                  onClick={handleSaveChanges}
                  className="bg-[#197EAB] text-white py-2 px-6 rounded"
                >
                  Update Form
                </button>
              </div>
            </div>
          </div>

          {/* Medical Experiences Section */}
          <div className="mb-6 mt-12 bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-medium text-[#197EAB] mb-3">Highlight Your Most Meaningful Experiences</h1>
            <p className="text-gray-600 mb-8">Select up to 3 experiences that you feel contributed most to your life and career</p>
            
            {/* Add info alert */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0 text-blue-400">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Click "Save All Experiences" below to permanently save your experiences to your profile and mark your selections as most meaningful.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-medium mb-4">Your Selected Experiences:</h2>
            
            {/* Checkboxes */}
            <div className="space-y-4 mb-8">
              {experiences.map(exp => (
                <div key={exp._id || exp.tempId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={exp._id || exp.tempId}
                    checked={selectedExperiences.includes(exp._id || exp.tempId)}
                    onChange={() => handleExperienceToggle(exp._id || exp.tempId)}
                    className="h-5 w-5 text-[#197EAB] border-gray-300 rounded"
                  />
                  <label htmlFor={exp._id || exp.tempId} className="ml-3 text-lg text-gray-800">
                    {exp.organization} – {exp.positionTitle}
                  </label>
                </div>
              ))}
            </div>
            
            {/* Optional expansion textarea */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="h-5 w-5 text-[#197EAB] border-gray-300 rounded"
                />
                <label htmlFor="useAI" className="ml-3 text-lg text-gray-800">
                  Generate AI-Powered Insights
                </label>
              </div>
              
              {useAI && (
                <>
              <p className="text-gray-600 mb-3">Would you like the AI Assistant to expand on any of them? (Optional)</p>
              <textarea
                className="w-full border border-gray-300 rounded p-4 text-gray-700 text-base leading-relaxed"
                rows="5"
                maxLength="300"
                value={expansionNotes}
                onChange={handleTextAreaChange}
              ></textarea>
              <div className="text-right text-gray-500 text-sm mt-1">
                {charCount} / 300
              </div>
                </>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end gap-4">
              <button 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                onClick={handleReuploadCV}
              >
                Re-upload CV
              </button>
              <button 
                className="px-6 py-3 bg-[#197EAB] text-white rounded-md font-medium"
                onClick={handleSaveMedicalExperiences}
                disabled={isEnhancing}
              >
                {isEnhancing ? 'Generating Insights...' : (useAI ? 'Generate Insights' : 'Save All Experiences')}
              </button>
            </div>
          </div>
          
          {/* AI Insights Component - Show while loading or when generated */}
          {(formSubmitted && useAI && enhancedExperiences.length > 0) || isEnhancing ? (
            <div className="mt-16 bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-10">
                <svg className="w-8 h-8 mr-3 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.25 3L10.75 7L8.75 8.5L11.25 10.5L8.75 12.5L10.75 15L9.25 17H6.75L5.25 15L7.25 12.5L4.75 10.5L7.25 8.5L5.75 7L7.25 3H9.25Z" fill="currentColor"/>
                  <path d="M17.25 3L18.75 7L16.75 8.5L19.25 10.5L16.75 12.5L18.75 15L17.25 17H14.75L13.25 15L15.25 12.5L12.75 10.5L15.25 8.5L13.75 7L15.25 3H17.25Z" fill="currentColor"/>
                  <path d="M12 15C15.866 15 19 18.134 19 22H5C5 18.134 8.13401 15 12 15Z" fill="currentColor"/>
                </svg>
                <h2 className="text-3xl font-medium text-purple-700">AI-Powered Insights</h2>
              </div>
              
              {isEnhancing ? (
                /* Loading state inside the insights box */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-gray-700 mb-2">Generating insights...</p>
                  <p className="text-sm text-gray-500">This may take a few moments</p>
                </div>
              ) : (
                /* Insights content when loaded */
              <div className="space-y-12">
                  {enhancedExperiences.map((exp, index) => (
                    <div key={exp._id || index}>
                      <h3 className="text-xl font-medium mb-4">{index + 1}. {exp.organization} – {exp.positionTitle}</h3>
                      <p className="text-lg text-purple-700 leading-relaxed">{exp.expandedDescription}</p>
                  </div>
                ))}
                  
                  {/* Save button after insights */}
                  <div className="flex justify-center mt-10">
                    <button 
                      className="px-8 py-3 bg-[#197EAB] text-white rounded-md font-medium text-lg"
                      onClick={saveAllExperiences}
                    >
                      Save All Experiences
                    </button>
              </div>
            </div>
          )}
            </div>
          ) : null}
          
          {/* Success Alert */}
          {showAlert && (
            <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>Data saved successfully!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}