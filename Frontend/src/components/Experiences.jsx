import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { experiences as experiencesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CombinedExperienceComponents() {
  const navigate = useNavigate();

  const [stage, setStage] = useState('upload'); 
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState({
    organization: 'Not specified',
    experienceType: 'Not specified',
    positionTitle: 'Not specified',
    department: 'Not specified',
    startDate: 'Not specified',
    endDate: 'Not specified',
    isCurrent: false,
    country: 'Not specified',
    state: 'Not specified',
    participationFrequency: 'Not specified',
    setting: 'Not specified',
    focusArea: 'Not specified',
    description: 'Not specified'
  });
  const [experiences, setExperiences] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Data saved successfully!');
  const fileInputRef = useRef(null);

  // Medical Experiences State
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [expansionNotes, setExpansionNotes] = useState(
    '"Highlight research contribution and personal growth"\n"Emphasize my exposure to emergency medicine and decision-making"\n"Show how this work impacted my view on service and leadership"'
  );
  const [charCount, setCharCount] = useState(231);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // AI Insights State
  const [aiExpandedExperiences, setAiExpandedExperiences] = useState([]);
  const [selectedExpansions, setSelectedExpansions] = useState({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

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
            isCurrent: isCurrentPosition(text),
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
            isCurrent: isCurrentPosition(text),
            country: extractLocation(text).country || 'Not specified',
            state: extractLocation(text).state || 'Not specified',
            participationFrequency: 'Full-time',
            setting: 'University',
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
    
    // Look for date ranges in various formats
    // Format: "Month Year - Month Year" or "Month Year to Month Year"
    const dateRangeRegex = new RegExp(`((?:${monthPattern})\\s+\\d{4})\\s*(?:-|to|–|through|until)\\s*((?:${monthPattern})\\s+\\d{4}|present|current|now|ongoing)`, 'i');
    const dateRangeMatch = text.match(dateRangeRegex);
    
    if (dateRangeMatch) {
    return {
        start: dateRangeMatch[1],
        end: dateRangeMatch[2].match(/present|current|now|ongoing/i) ? null : dateRangeMatch[2]
      };
    }
    
    // Try to find dates in different parts of the text
    // Look for start date patterns
    const startDatePatterns = [
      // "From Month Year" or "Started Month Year"
      new RegExp(`(?:from|start(?:ed)?|begin(?:ning)?:?|since)\\s+((?:${monthPattern})\\s+\\d{4})`, 'i'),
      // "Month Year -" or "Month Year to"
      new RegExp(`((?:${monthPattern})\\s+\\d{4})\\s*(?:-|to|–|through|until)`, 'i'),
      // Just find any month + year as a fallback
      new RegExp(`\\b((?:${monthPattern})\\s+\\d{4})\\b`, 'i')
    ];
    
    // Look for end date patterns
    const endDatePatterns = [
      // "to Month Year" or "until Month Year"
      new RegExp(`(?:to|until|end(?:ed)?:?|through)\\s+((?:${monthPattern})\\s+\\d{4}|present|current|now|ongoing)`, 'i'),
      // "- Month Year" or "to Month Year"
      new RegExp(`(?:-|to|–|through|until)\\s+((?:${monthPattern})\\s+\\d{4}|present|current|now|ongoing)`, 'i'),
      // Look for present/current/now mentions
      /\b(present|current|now|ongoing)\b/i
    ];
    
    let startDate = null;
    let endDate = null;
    
    // Try each start date pattern
    for (const pattern of startDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        startDate = match[1];
        break;
      }
    }
    
    // Try each end date pattern
    for (const pattern of endDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        // If it matched "present" or similar, set to null
        endDate = match[1] && match[1].match(/present|current|now|ongoing/i) ? null : match[1];
        break;
      }
    }
    
    // If we only found start date but no end date, look for the next date mention as possible end date
    if (startDate && !endDate) {
      const remainingText = text.substring(text.indexOf(startDate) + startDate.length);
      const nextDateMatch = remainingText.match(new RegExp(`\\b((?:${monthPattern})\\s+\\d{4})\\b`, 'i'));
      
      if (nextDateMatch) {
        // Make sure it's not the same date and it's after the start date
        const nextDate = nextDateMatch[1];
        if (nextDate !== startDate && isLaterDate(startDate, nextDate)) {
          endDate = nextDate;
        }
      }
    }
    
    return {
      start: startDate,
      end: endDate
    };
  };
  
  // Helper function to check if date2 is later than date1
  const isLaterDate = (date1, date2) => {
    const year1 = parseInt(date1.match(/\d{4}/)[0], 10);
    const year2 = parseInt(date2.match(/\d{4}/)[0], 10);
    
    if (year2 > year1) return true;
    if (year2 < year1) return false;
    
    // Same year, check month
    const monthNames = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    
    const month1Match = date1.match(new RegExp(`(${Object.keys(monthNames).join('|')})`, 'i'));
    const month2Match = date2.match(new RegExp(`(${Object.keys(monthNames).join('|')})`, 'i'));
    
    if (month1Match && month2Match) {
      const month1 = monthNames[month1Match[1].toLowerCase()];
      const month2 = monthNames[month2Match[1].toLowerCase()];
      return month2 > month1;
    }
    
    return false; // Can't determine, assume not later
  };
  
  const isCurrentPosition = (text) => {
    // Only return true for explicit mentions of current/present/ongoing
    return /\b(?:present|current|ongoing|now|to\s+(?:present|now|date|today))\b/i.test(text);
    // Note: Just having no end date is NOT enough to mark as current
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
    // Look for explicit frequency mentions
    if (text.match(/daily|every\s*day|7\s*days\s*(?:a|per)\s*week|day\s*to\s*day/i)) 
      return 'Daily';
    
    if (text.match(/weekly|every\s*week|once\s*a\s*week|twice\s*a\s*week|biweekly|1-2\s*days\s*(?:a|per)\s*week|2-3\s*days\s*(?:a|per)\s*week/i)) 
      return 'Weekly';
    
    if (text.match(/monthly|every\s*month|once\s*a\s*month|twice\s*a\s*month|1-2\s*days\s*(?:a|per)\s*month|bimonthly/i)) 
      return 'Monthly';
    
    if (text.match(/quarterly|every\s*quarter|once\s*a\s*quarter|four\s*times\s*a\s*year|4\s*times\s*(?:a|per)\s*year/i)) 
      return 'Quarterly';
    
    // Look for employment status indicators - only when explicitly mentioned
    if (text.match(/\b(?:full[- ]time|40\s*hours\s*(?:a|per)\s*week|permanent\s*position)\b/i)) 
    return 'Full-time';
    
    if (text.match(/\b(?:part[- ]time|20\s*hours\s*(?:a|per)\s*week|half[- ]time)\b/i)) 
      return 'Part-time';
    
    // Look for specific hours mentions
    if (text.match(/(\d+)\s*hours?\s*(?:a|per)\s*week/i)) {
      const match = text.match(/(\d+)\s*hours?\s*(?:a|per)\s*week/i);
      const hours = parseInt(match[1], 10);
      
      if (hours >= 32) return 'Full-time';
      if (hours > 0) return 'Part-time';
    }
    
    // Do not try to infer when there's no clear indication
    return 'Not specified';
  };
  
  const determineSetting = (text) => {
    // Look for specific setting keywords in the text
    // Teaching Hospital
    if (text.match(/\b(?:teaching hospital|academic hospital|medical education hospital|residency program hospital)\b/i)) 
      return 'Teaching Hospital';
    
    // Academic Medical Center
    if (text.match(/\b(?:academic medical center|university hospital|medical school hospital|medical campus)\b/i)) 
      return 'Academic Medical Center';
    
    // Hospital
    if (text.match(/\b(?:hospital|medical center|inpatient|ward|emergency room|er\b|icu|intensive care)\b/i)) 
      return 'Hospital';
    
    // Clinic
    if (text.match(/\b(?:clinic|outpatient center|outpatient clinic|doctor.?s office|ambulatory care)\b/i)) 
      return 'Clinic';
    
    // Private Practice
    if (text.match(/\b(?:private practice|physician.?s office|group practice)\b/i)) 
      return 'Private Practice';
    
    // Laboratory
    if (text.match(/\b(?:lab|laboratory|research lab|bench|experiment)\b/i)) 
      return 'Laboratory';
    
    // University
    if (text.match(/\b(?:university|college|school|campus|lecture hall|classroom|academia)\b/i)) 
      return 'University';
    
    // Research Institution
    if (text.match(/\b(?:research institute|research center|institute|research foundation)\b/i)) 
      return 'Research Institution';
    
    // Community Health Center
    if (text.match(/\b(?:community health|neighborhood center|community center|public health clinic)\b/i)) 
      return 'Community Health Center';
    
    // Outpatient Facility
    if (text.match(/\b(?:outpatient facility|ambulatory care center|day surgery center)\b/i)) 
      return 'Outpatient Facility';
    
    // Telehealth
    if (text.match(/\b(?:telehealth|telemedicine|virtual care|remote care|online consultation)\b/i)) 
      return 'Telehealth';
    
    // Rural Health Facility
    if (text.match(/\b(?:rural health|rural clinic|rural hospital|underserved area|small town clinic)\b/i)) 
      return 'Rural Health Facility';
    
    // International
    if (text.match(/\b(?:international|abroad|overseas|foreign country|global health)\b/i)) 
      return 'International';
    
    // Remote
    if (text.match(/\b(?:remote|virtual|online|zoom|work from home|wfh)\b/i)) 
      return 'Remote';
    
    // If no clear setting is mentioned, don't try to infer
    return 'Not specified';
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
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      
      // Always try to use server-side parsing first, especially for PDFs
      console.log('Attempting server-side parsing...');
      const response = await experiencesAPI.parseCV(file);
      
      if (response && response.success && response.experiences && response.experiences.length > 0) {
        console.log(`Server parsing successful: ${response.experiences.length} experiences found`);
        setExperiences(response.experiences);
        setTotalPages(response.experiences.length);
        setCurrentPage(1);
        setFormData(response.experiences[0]);
        
        clearInterval(interval);
        setProgress(100);
        
        // Wait a moment to show 100% before transitioning
        setTimeout(() => {
          setStage('form');
        }, 500);
        return;
      } else {
        console.warn('Server parsing returned no experiences:', response);
        
        // For PDFs, we won't attempt client-side parsing as it won't work well
        if (file.type === 'application/pdf') {
          console.log('PDF detected, not attempting client-side parsing');
          
          // If server parsing failed, but we have an experiences array (even empty), use it
          if (response && response.experiences) {
            // If we have at least an empty array, continue with it
            console.log('Using server response with empty experiences array');
            
            // Process the experiences to handle properties consistently
            const processedExperiences = response.experiences.map(exp => {
              // Create a normalized experience object
              const normalizedExp = { ...exp };
              
              // Ensure isCurrent is properly set based on multiple properties
              if (exp.current === true || exp.isCurrent === true || 
                  (exp.endDate && typeof exp.endDate === 'string' && 
                   exp.endDate.toLowerCase().match(/present|current|ongoing|now/))) {
                normalizedExp.isCurrent = true;
                // Remove end date if it's current
                normalizedExp.endDate = '';
              } else {
                normalizedExp.isCurrent = false;
              }
              
              // Remove duplicate current property
              if ('current' in normalizedExp) {
                delete normalizedExp.current;
              }
              
              // Ensure focus area is set from department if needed
              if ((!normalizedExp.focusArea || normalizedExp.focusArea === 'Not specified') && 
                  normalizedExp.department && normalizedExp.department !== 'Not specified') {
                normalizedExp.focusArea = normalizedExp.department;
              }
              
              // Ensure primaryFocusArea is mapped to focusArea
              if (normalizedExp.primaryFocusArea && !normalizedExp.focusArea) {
                normalizedExp.focusArea = normalizedExp.primaryFocusArea;
                delete normalizedExp.primaryFocusArea;
              }
              
              return normalizedExp;
            });
            
            setExperiences(processedExperiences);
            setTotalPages(processedExperiences.length || 1);
            
            // If array is empty, create a blank experience
            if (processedExperiences.length === 0) {
              const blankExperience = {
                organization: 'Not specified',
                experienceType: 'Not specified',
                positionTitle: 'Not specified',
                department: 'Not specified',
                startDate: 'Not specified',
                endDate: 'Not specified',
                isCurrent: false,
                country: 'Not specified',
                state: 'Not specified',
                participationFrequency: 'Not specified',
                setting: 'Not specified',
                focusArea: 'Not specified',
                description: 'Not specified'
              };
              
              setExperiences([blankExperience]);
              setTotalPages(1);
              setFormData(blankExperience);
            } else {
              setFormData(processedExperiences[0]);
            }
            
        clearInterval(interval);
        setProgress(100);
        
        setTimeout(() => {
          setStage('form');
        }, 500);
            return;
          }
          
          // If we get here with a PDF and no usable response, alert the user
          clearInterval(interval);
          setProgress(0);
          alert('Could not extract experiences from the PDF. Please try uploading a different file or manually add your experiences.');
          setStage('upload');
          return;
        }
        
        // Only attempt client-side parsing for non-PDF files
        console.log('Attempting client-side parsing for non-PDF file...');
      }
      
      // Fall back to local parsing for non-PDFs or if backend parsing fails
      const parsed = await parseCV(file);
        if (parsed && parsed.length > 0) {
        console.log(`Client-side parsing successful: ${parsed.length} experiences found`);
        // Try to save the parsed experiences to MongoDB, but don't block on failure
        try {
          const result = await experiencesAPI.saveMultiple(parsed);
          
          // If the backend returned experiences with IDs, use those
          if (result && result.experiences && result.experiences.length > 0) {
            // Process the experiences to handle properties consistently
            const processedExperiences = result.experiences.map(exp => {
              // Create a normalized experience object
              const normalizedExp = { ...exp };
              
              // Ensure isCurrent is properly set based on multiple properties
              if (exp.current === true || exp.isCurrent === true || 
                  (exp.endDate && typeof exp.endDate === 'string' && 
                   exp.endDate.toLowerCase().match(/present|current|ongoing|now/))) {
                normalizedExp.isCurrent = true;
                // Remove end date if it's current
                normalizedExp.endDate = '';
              } else {
                normalizedExp.isCurrent = false;
              }
              
              // Remove duplicate current property
              if ('current' in normalizedExp) {
                delete normalizedExp.current;
              }
              
              // Ensure focus area is set from department if needed
              if ((!normalizedExp.focusArea || normalizedExp.focusArea === 'Not specified') && 
                  normalizedExp.department && normalizedExp.department !== 'Not specified') {
                normalizedExp.focusArea = normalizedExp.department;
              }
              
              // Ensure primaryFocusArea is mapped to focusArea
              if (normalizedExp.primaryFocusArea && !normalizedExp.focusArea) {
                normalizedExp.focusArea = normalizedExp.primaryFocusArea;
                delete normalizedExp.primaryFocusArea;
              }
              
              return normalizedExp;
            });
            
            setExperiences(processedExperiences);
            setTotalPages(processedExperiences.length);
            setFormData(processedExperiences[0]);
          } else {
            // Process the locally parsed experiences
            const processedParsed = parsed.map(exp => {
              // Create a normalized experience object
              const normalizedExp = { ...exp };
              
              // Ensure isCurrent is properly set
              if (exp.current === true || exp.isCurrent === true || 
                  (exp.endDate && typeof exp.endDate === 'string' && 
                   exp.endDate.toLowerCase().match(/present|current|ongoing|now/))) {
                normalizedExp.isCurrent = true;
                // Remove end date if it's current
                normalizedExp.endDate = '';
              } else {
                normalizedExp.isCurrent = false;
              }
              
              // Remove duplicate current property
              if ('current' in normalizedExp) {
                delete normalizedExp.current;
              }
              
              // Ensure focus area is set from department if needed
              if ((!normalizedExp.focusArea || normalizedExp.focusArea === 'Not specified') && 
                  normalizedExp.department && normalizedExp.department !== 'Not specified') {
                normalizedExp.focusArea = normalizedExp.department;
              }
              
              // Map primaryFocusArea to focusArea if needed
              if (normalizedExp.primaryFocusArea && !normalizedExp.focusArea) {
                normalizedExp.focusArea = normalizedExp.primaryFocusArea;
                delete normalizedExp.primaryFocusArea;
              }
              
              return normalizedExp;
            });
            
            setExperiences(processedParsed);
            setTotalPages(processedParsed.length);
            setFormData(processedParsed[0]);
          }
        } catch (saveError) {
          console.error('Error saving parsed experiences to MongoDB:', saveError);
          // Continue with the locally parsed experiences
          const processedParsed = parsed.map(exp => {
            // Create a normalized experience object
            const normalizedExp = { ...exp };
            
            // Ensure isCurrent is properly set
            if (exp.current === true || exp.isCurrent === true || 
                (exp.endDate && typeof exp.endDate === 'string' && 
                 exp.endDate.toLowerCase().match(/present|current|ongoing|now/))) {
              normalizedExp.isCurrent = true;
              // Remove end date if it's current
              normalizedExp.endDate = '';
            } else {
              normalizedExp.isCurrent = false;
            }
            
            // Remove duplicate current property
            if ('current' in normalizedExp) {
              delete normalizedExp.current;
            }
            
            // Ensure focus area is set from department if needed
            if ((!normalizedExp.focusArea || normalizedExp.focusArea === 'Not specified') && 
                normalizedExp.department && normalizedExp.department !== 'Not specified') {
              normalizedExp.focusArea = normalizedExp.department;
            }
            
            // Map primaryFocusArea to focusArea if needed
            if (normalizedExp.primaryFocusArea && !normalizedExp.focusArea) {
              normalizedExp.focusArea = normalizedExp.primaryFocusArea;
              delete normalizedExp.primaryFocusArea;
            }
            
            return normalizedExp;
          });
          
          setExperiences(processedParsed);
          setTotalPages(processedParsed.length);
          setFormData(processedParsed[0]);
        }
        
          setCurrentPage(1);
          clearInterval(interval);
          setProgress(100);
          
        // Wait a moment to show 100% before transitioning
          setTimeout(() => {
            setStage('form');
          }, 500);
        } else {
          throw new Error('No experiences found in CV');
      }
    } catch (error) {
      console.error('Error parsing CV:', error);
      clearInterval(interval);
        alert('Failed to parse CV. Please try again or manually enter your experiences.');
      setStage('upload');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
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
      
      // Save the current experience first to make sure form changes are included
      const currentExperience = { ...formData };
      
      // Update the experiences array with the current form data
      const updatedExperiences = [...experiences];
      updatedExperiences[currentPage - 1] = currentExperience;
      
      // Save all experiences one by one
      for (let i = 0; i < updatedExperiences.length; i++) {
        const experienceToSave = { ...updatedExperiences[i] };
        
        // If the experience has an id, update it, otherwise create a new one
        try {
          let response;
          if (experienceToSave._id) {
            response = await experiencesAPI.update(experienceToSave._id, experienceToSave);
          } else {
            response = await experiencesAPI.create(experienceToSave);
          }
          
          // Update the experiences array with any returned data (like new IDs)
          if (response) {
            updatedExperiences[i] = { ...experienceToSave, ...response };
          }
        } catch (error) {
          console.error(`Error saving experience ${i+1}:`, error);
          // Continue with next experience even if one fails
        }
      }
      
      // Update the experiences state with the saved data
      setExperiences(updatedExperiences);
      
      // Save experiences data to localStorage for resuming progress
      try {
        const currentUserId = localStorage.getItem('userId');
        localStorage.setItem('matchmaker_experiences', JSON.stringify(updatedExperiences));
        localStorage.setItem('matchmaker_experiences_timestamp', new Date().toISOString());
        localStorage.setItem('matchmaker_experiences_userId', currentUserId);
      } catch (e) {
        console.warn('Could not save experiences to localStorage:', e);
      }
      
      console.log('Saved all experiences to MongoDB');
      setAlertMessage('Data saved successfully!');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error saving experiences:', error);
      alert('Failed to save experiences. Please try again.');
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current.click();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setFormData(experiences[newPage - 1]);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setFormData(experiences[newPage - 1]);
    }
  };

  const handleExperienceToggle = (id) => {
    if (selectedExperiences.includes(id)) {
      setSelectedExperiences(selectedExperiences.filter(expId => expId !== id));
    } else {
      if (selectedExperiences.length < 3) {
        setSelectedExperiences([...selectedExperiences, id]);
      }
    }
  };

  const handleTextAreaChange = (e) => {
    const text = e.target.value;
    setExpansionNotes(text);
    setCharCount(text.length);
  };

  // Sample AI expansions for each experience (in a real app, you'd get these from an API)
  const generateAIExpansions = (experience) => {
    const baseDescription = experience.description || '';
    
    // Generate three different AI expansions
    return [
      {
        id: `${experience._id}-expansion-1`,
        text: `${baseDescription} Working at ${experience.organization} sharpened my technical skills and strengthened my scientific curiosity. This experience confirmed my passion for ${experience.experienceType.toLowerCase() || 'medicine'} and my desire to contribute to medical innovation.`
      },
      {
        id: `${experience._id}-expansion-2`,
        text: `My time at ${experience.organization} exposed me to ${experience.setting || 'clinical'} environments and reinforced my interest in ${experience.focusArea || 'patient care'}. The experience with ${experience.positionTitle} responsibilities gave me valuable insights into healthcare delivery.`
      },
      {
        id: `${experience._id}-expansion-3`,
        text: `At ${experience.organization}, I developed crucial skills in ${experience.focusArea || 'patient care'} while working as a ${experience.positionTitle}. This experience taught me the importance of collaboration, attention to detail, and adaptability in ${experience.setting || 'medical'} settings.`
      }
    ];
  };
  
  // Simulate AI expansion generation 
  const generateAIInsights = async () => {
    setLoadingAi(true);
    setAiError(null);
    
    try {
      // In a real app, you would call an API endpoint here
      // For demo purposes, we're generating mock expansions locally
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const selectedExperienceDetails = experiences.filter(exp => 
        selectedExperiences.includes(exp._id)
      );
      
      // Generate expansions for each selected experience
      const expansions = selectedExperienceDetails.map(exp => {
        return {
          experience: exp,
          expansions: generateAIExpansions(exp)
        };
      });
      
      setAiExpandedExperiences(expansions);
      
      // Initialize selected expansions with the first option for each
      const initialSelections = {};
      expansions.forEach(item => {
        initialSelections[item.experience._id] = item.expansions[0].id;
      });
      
      // Try to load previously saved selections
      try {
        const savedSelections = localStorage.getItem('matchmaker_ai_expansions');
        if (savedSelections) {
          const parsed = JSON.parse(savedSelections);
          setSelectedExpansions({...initialSelections, ...parsed});
        } else {
          setSelectedExpansions(initialSelections);
        }
      } catch (e) {
        console.warn('Error loading saved AI expansions:', e);
        setSelectedExpansions(initialSelections);
      }
      
      // Save the generated AI experiences to localStorage
      localStorage.setItem('matchmaker_ai_expanded_experiences', JSON.stringify(expansions));
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiError('Failed to generate AI insights. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };
  
  // Handle selecting an AI expansion
  const handleSelectExpansion = (experienceId, expansionId) => {
    setSelectedExpansions(prev => ({
      ...prev,
      [experienceId]: expansionId
    }));
    
    // Save selection to localStorage
    try {
      localStorage.setItem('matchmaker_ai_expansions', JSON.stringify({
        ...selectedExpansions,
        [experienceId]: expansionId
      }));
    } catch (e) {
      console.warn('Error saving AI expansion selection:', e);
    }
  };
  
  // Function to finalize AI insights and mark section as complete
  const finalizeAiInsights = async () => {
    try {
      // Here you would typically send the selections to your backend
      // For demo purposes, we're just saving to localStorage
      
      // Save final selections
      localStorage.setItem('matchmaker_ai_expansions_finalized', JSON.stringify({
        selectedExperiences,
        selectedExpansions,
        aiExpandedExperiences,
        timestamp: new Date().toISOString()
      }));
      
      // Mark section as complete - set multiple flags to ensure dashboard picks it up
      localStorage.setItem('matchmaker_experiences_complete', 'true');
      localStorage.setItem('matchmaker_experiences_status', 'Completed');
      
      // Update overall application progress
      let progressData = {};
      try {
        const progressStr = localStorage.getItem('matchmaker_progress');
        if (progressStr) {
          progressData = JSON.parse(progressStr);
        }
      } catch (e) {
        console.warn('Error parsing progress data, starting fresh:', e);
      }
      
      // Ensure the experiences section is explicitly marked as complete with all possible fields
      progressData.experiences = {
        complete: true,
        status: 'Completed', 
        completed: true,
        timestamp: new Date().toISOString()
      };
      
      // Save updated progress data
      localStorage.setItem('matchmaker_progress', JSON.stringify(progressData));
      
      console.log('Progress updated:', progressData);
      
      // Show success message
      setAlertMessage('Experiences section completed! Redirecting to dashboard...');
      setShowAlert(true);
      
      // After a brief delay, redirect to dashboard
      setTimeout(() => {
        setShowAlert(false);
        
        // Try to update a direct dashboard status indicator if it exists
        try {
          if (typeof window !== 'undefined') {
            // Force using direct localStorage format that dashboard might be using
            const dashboardProgress = JSON.parse(localStorage.getItem('matchmaker_progress') || '{}');
            dashboardProgress.experiences = { status: 'Completed', complete: true };
            localStorage.setItem('matchmaker_progress', JSON.stringify(dashboardProgress));
            
            // Also set a direct status key that dashboard might be checking
            localStorage.setItem('matchmaker_section_experiences', 'Completed');
          }
        } catch (e) {
          console.warn('Error setting additional completion flags:', e);
        }
        
        // Force reload dashboard to reflect the updated progress
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('Error finalizing AI insights:', error);
      alert('Failed to finalize AI insights. Please try again.');
    }
  };

  // Modify handleSaveMedicalExperiences to trigger AI expansion generation
  const handleSaveMedicalExperiences = async () => {
    try {
      // Get selected experiences details
      const selectedExperienceDetails = experiences.filter(exp => 
        selectedExperiences.includes(exp._id)
      );
      
      const medicalFormData = {
        selectedExperiences,
        selectedExperienceDetails,
        expansionNotes
      };
      
      // Check if we're using predefined medical experiences
      const isUsingPredefined = selectedExperiences.some(id => 
        medicalExperiences.some(exp => exp.id === id)
      );
      
      // Only try to mark experiences if we're not using predefined ones and there are IDs
      if (!isUsingPredefined && selectedExperiences.length > 0) {
        // Mark selected experiences as most meaningful
        for (const expId of selectedExperiences) {
          if (expId) {
            try {
              await experiencesAPI.markMostMeaningful(expId);
            } catch (error) {
              console.warn(`Could not mark experience ${expId} as meaningful:`, error);
            }
          }
        }
      }
      
      console.log('Medical experiences form data saved:', medicalFormData);
      
      // Save selections to localStorage for future editing
      try {
        localStorage.setItem('matchmaker_meaningful_experiences', JSON.stringify({
          selectedExperiences,
          expansionNotes
        }));
      } catch (e) {
        console.warn('Could not save meaningful experiences to localStorage:', e);
      }
      
      setAlertMessage('Meaningful experiences saved! Generating AI insights...');
      setShowAlert(true);
      
      setTimeout(() => {
        setShowAlert(false);
      setFormSubmitted(true);
        
        // Generate AI insights after saving
        generateAIInsights();
      }, 1500);
    } catch (error) {
      console.error('Error saving meaningful experiences:', error);
      alert('Failed to save meaningful experiences. Please try again.');
    }
  };

  // Load AI expanded experiences on component mount
  useEffect(() => {
    try {
      // Load AI expanded experiences if available
      const savedAiExp = localStorage.getItem('matchmaker_ai_expanded_experiences');
      if (savedAiExp) {
        setAiExpandedExperiences(JSON.parse(savedAiExp));
      }
      
      // Load selected expansions if available
      const savedSelections = localStorage.getItem('matchmaker_ai_expansions');
      if (savedSelections) {
        setSelectedExpansions(JSON.parse(savedSelections));
      }
    } catch (e) {
      console.warn('Error loading saved AI data:', e);
    }
  }, []);
  
  // Load meaningful experiences selection from localStorage
  useEffect(() => {
    try {
      const savedMeaningfulExp = localStorage.getItem('matchmaker_meaningful_experiences');
      if (savedMeaningfulExp) {
        const parsedData = JSON.parse(savedMeaningfulExp);
        if (parsedData.selectedExperiences) {
          setSelectedExperiences(parsedData.selectedExperiences);
        }
        if (parsedData.expansionNotes) {
          setExpansionNotes(parsedData.expansionNotes);
        }
        // If we had saved meaningful experiences, set formSubmitted to true
        // so the AI insights section shows
        if (parsedData.selectedExperiences && parsedData.selectedExperiences.length > 0) {
          setFormSubmitted(true);
        }
      }
    } catch (e) {
      console.warn('Could not load meaningful experiences from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (experiences.length > 0 && currentPage <= experiences.length) {
      setFormData(experiences[currentPage - 1]);
    }
  }, [currentPage, experiences]);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        // First check localStorage for saved experiences
        const savedExperiences = localStorage.getItem('matchmaker_experiences');
        const timestamp = localStorage.getItem('matchmaker_experiences_timestamp');
        const token = localStorage.getItem('token');
        const currentUserId = localStorage.getItem('userId');
        const storedUserId = localStorage.getItem('matchmaker_experiences_userId');
        
        // If we have saved experiences that are less than 24 hours old, use them
        // BUT only if they belong to the current user
        if (savedExperiences && timestamp && storedUserId && storedUserId === currentUserId) {
          const lastSaved = new Date(timestamp);
          const now = new Date();
          const hoursSinceSaved = (now - lastSaved) / (1000 * 60 * 60);
          
          if (hoursSinceSaved < 24) {
            console.log('Loading experiences from localStorage');
            const parsedExperiences = JSON.parse(savedExperiences);
            
            if (parsedExperiences && parsedExperiences.length > 0) {
              setExperiences(parsedExperiences);
              setTotalPages(parsedExperiences.length);
              setFormData(parsedExperiences[0]);
              setCurrentPage(1);
              setStage('form');
              return;
            }
          }
        } else if (savedExperiences && (!storedUserId || storedUserId !== currentUserId)) {
          // Clear localStorage if experiences belong to a different user
          console.log('Clearing localStorage experiences for different user');
          localStorage.removeItem('matchmaker_experiences');
          localStorage.removeItem('matchmaker_experiences_timestamp');
          localStorage.removeItem('matchmaker_experiences_userId');
          localStorage.removeItem('matchmaker_meaningful_experiences');
          localStorage.removeItem('matchmaker_ai_expanded_experiences');
          localStorage.removeItem('matchmaker_ai_expansions');
          localStorage.removeItem('matchmaker_ai_expansions_finalized');
        }
        
        // If no valid localStorage data, try to load from the server
        const response = await experiencesAPI.getAll();
        
        if (response && response.length > 0) {
          // Process the experiences to ensure consistency
          const processedExperiences = response.map(exp => {
            // Create a normalized experience object
            const normalizedExp = { ...exp };
            
            // Ensure isCurrent is properly set
            if (exp.current === true || exp.isCurrent === true || 
                (exp.endDate && typeof exp.endDate === 'string' && 
                 exp.endDate.toLowerCase().match(/present|current|ongoing|now/))) {
              normalizedExp.isCurrent = true;
              normalizedExp.endDate = '';
            } else {
              normalizedExp.isCurrent = false;
            }
            
            // Remove duplicate current property
            if ('current' in normalizedExp) {
              delete normalizedExp.current;
            }
            
            // Ensure focus area is set from department if needed
            if ((!normalizedExp.focusArea || normalizedExp.focusArea === 'Not specified') && 
                normalizedExp.department && normalizedExp.department !== 'Not specified') {
              normalizedExp.focusArea = normalizedExp.department;
            }
            
            // Map primaryFocusArea to focusArea if needed
            if (normalizedExp.primaryFocusArea && !normalizedExp.focusArea) {
              normalizedExp.focusArea = normalizedExp.primaryFocusArea;
              delete normalizedExp.primaryFocusArea;
            }
            
            return normalizedExp;
          });
          
          setExperiences(processedExperiences);
          setTotalPages(processedExperiences.length);
          setFormData(processedExperiences[0]);
          setCurrentPage(1);
          setStage('form');
          
          // Also save to localStorage for future use, including the user ID
          try {
            localStorage.setItem('matchmaker_experiences', JSON.stringify(processedExperiences));
            localStorage.setItem('matchmaker_experiences_timestamp', new Date().toISOString());
            localStorage.setItem('matchmaker_experiences_userId', currentUserId);
          } catch (e) {
            console.warn('Could not save experiences to localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Error loading experiences:', error);
      }
    };
    
    loadExperiences();
  }, []);

  useEffect(() => {
    if (stage === 'form' && formData) {
      // Format dates for display in the form
      let updatedFormData = { ...formData };
      
      // Handle start date formatting
      if (formData.startDate && formData.startDate !== 'Not specified') {
        try {
          const startDate = new Date(formData.startDate);
          if (!isNaN(startDate.getTime())) {
            // Format as YYYY-MM-DD for the input field
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            updatedFormData.startDate = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.warn('Could not format start date:', formData.startDate);
        }
      }
      
      // Handle end date and current status
      if ((formData.isCurrent === true) || // Explicitly check for true, not truthy values 
          (formData.current === true) || 
          (formData.endDate && 
           (typeof formData.endDate === 'string' && 
            (formData.endDate.toLowerCase().includes('present') || 
             formData.endDate.toLowerCase().includes('current') || 
             formData.endDate.toLowerCase().includes('ongoing'))))) {
        // Mark as current and clear end date for display
        updatedFormData.isCurrent = true;
        // Remove the 'current' property to avoid duplication
        delete updatedFormData.current;
        updatedFormData.endDate = '';
      } else if (formData.endDate && formData.endDate !== 'Not specified') {
        // Ensure isCurrent is false
        updatedFormData.isCurrent = false;
        // Remove the 'current' property to avoid duplication
        delete updatedFormData.current;
        
        try {
          const endDate = new Date(formData.endDate);
          if (!isNaN(endDate.getTime())) {
            // Format as YYYY-MM-DD for the input field
            const year = endDate.getFullYear();
            const month = String(endDate.getMonth() + 1).padStart(2, '0');
            const day = String(endDate.getDate()).padStart(2, '0');
            updatedFormData.endDate = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.warn('Could not format end date:', formData.endDate);
        }
      } else {
        // Explicitly set isCurrent to false for experiences with no end date 
        // but not marked as current
        updatedFormData.isCurrent = false;
        delete updatedFormData.current;
      }
      
      // If focus area is not specified but department is available, use department
      if ((!formData.focusArea || formData.focusArea === 'Not specified') && formData.department) {
        updatedFormData.focusArea = formData.department;
      }
      
      // Update the form data
      setFormData(updatedFormData);
    }
  }, [stage, formData?._id]);

  const handleReuploadCV = () => {
    setStage('upload');
  };

  // Handle current checkbox toggle
  const handleCurrentToggle = (e) => {
    const isChecked = e.target.checked;
    
    setFormData(prev => {
      const updated = { 
        ...prev, 
        isCurrent: isChecked,
        // Clear end date if marked as current
        endDate: isChecked ? '' : prev.endDate
      };
      
      // Remove the legacy 'current' property if it exists
      if ('current' in updated) {
        delete updated.current;
      }
      
      const updatedExperiences = [...experiences];
      updatedExperiences[currentPage - 1] = updated;
      setExperiences(updatedExperiences);
      
      return updated;
    });
  };

  // Additional useEffect to check and fix dashboard progress format
  useEffect(() => {
    // Check if we previously completed this section but dashboard doesn't show it
    const isCompleted = localStorage.getItem('matchmaker_experiences_complete') === 'true' || 
                        localStorage.getItem('matchmaker_experiences_status') === 'Completed';
    
    // Check if AI insights were finalized, which indicates completion
    const aiFinalized = localStorage.getItem('matchmaker_ai_expansions_finalized');
    
    // If we have evidence the section should be complete, ensure dashboard shows it
    if ((isCompleted || aiFinalized) && typeof window !== 'undefined' && window.location.pathname.indexOf('/dashboard') === -1) {
      console.log('Section appears to be complete, ensuring dashboard flags are set');
      
      try {
        // Update all possible progress indicators
        const dashboardProgress = JSON.parse(localStorage.getItem('matchmaker_progress') || '{}');
        
        // Update using multiple possible formats the dashboard might check
        dashboardProgress.experiences = { 
          status: 'Completed', 
          complete: true,
          completed: true,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('matchmaker_progress', JSON.stringify(dashboardProgress));
        localStorage.setItem('matchmaker_section_experiences', 'Completed');
        localStorage.setItem('matchmaker_experiences_status', 'Completed');
        
        console.log('Dashboard progress indicators updated:', dashboardProgress);
      } catch (e) {
        console.warn('Error updating dashboard progress indicators:', e);
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className='text-center text-[36px] pt-[1rem] text-[#197EAB] font-semibold'>Experiences</h1>
      {/* Upload Stage */}
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
                        checked={formData.isCurrent}
                        onChange={handleCurrentToggle}
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
                      <option value="Academic Medical Center">Academic Medical Center</option>
                      <option value="Teaching Hospital">Teaching Hospital</option>
                      <option value="Research Institution">Research Institution</option>
                      <option value="Private Practice">Private Practice</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="University">University</option>
                      <option value="Community Health Center">Community Health Center</option>
                      <option value="Outpatient Facility">Outpatient Facility</option>
                      <option value="Telehealth">Telehealth</option>
                      <option value="Rural Health Facility">Rural Health Facility</option>
                      <option value="International">International</option>
                      <option value="Remote">Remote</option>
                      <option value="Other">Other</option>
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
                    value={formData.focusArea}
                    onChange={(e) => handleFormChange('focusArea', e.target.value)}
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
                  className="bg-[#197EAB]  text-white py-2 px-6 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Medical Experiences Section */}
          <div className="mb-6 mt-12 bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-medium text-[#197EAB] mb-3">Highlight Your Most Meaningful Experiences</h1>
            <p className="text-gray-600 mb-8">Select up to 3 experiences that you feel contributed most to your life and career</p>
            
            {/* Checkboxes for actual user experiences */}
            <div className="space-y-4 mb-8">
              {experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <div key={exp._id || index} className="flex items-center">
                  <input
                    type="checkbox"
                      id={exp._id || `exp-${index}`}
                      checked={selectedExperiences.includes(exp._id || `exp-${index}`)}
                      onChange={() => handleExperienceToggle(exp._id || `exp-${index}`)}
                    className="h-5 w-5 text-[#197EAB] border-gray-300 rounded"
                      disabled={selectedExperiences.length >= 3 && !selectedExperiences.includes(exp._id || `exp-${index}`)}
                    />
                    <label htmlFor={exp._id || `exp-${index}`} className="ml-3 text-lg text-gray-800">
                      {exp.organization} – {exp.positionTitle} 
                      {exp.startDate && exp.startDate !== 'Not specified' && (
                        <span className="text-gray-600 ml-2">
                          ({exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate})
                        </span>
                      )}
                  </label>
                </div>
                ))
              ) : (
                <p>No experiences found. Please add experiences first.</p>
              )}
            </div>
            
            {/* Optional expansion textarea */}
            <div className="mb-8">
              <p className="text-gray-600 mb-3">Would you like the AI Assistant to expand on any of them? (Optional)</p>
              <textarea
                className="w-full border border-gray-300 rounded p-4 text-gray-700 text-base leading-relaxed"
                rows="5"
                maxLength="300"
                value={expansionNotes}
                onChange={handleTextAreaChange}
                placeholder="Example: 'Highlight research contribution and personal growth' or 'Emphasize my exposure to emergency medicine and decision-making'"
              ></textarea>
              <div className="text-right text-gray-500 text-sm mt-1">
                {charCount} / 300
              </div>
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
                className="px-6 py-3 bg-[#197EAB] text-white rounded-mdfont-medium"
                onClick={handleSaveMedicalExperiences}
                disabled={selectedExperiences.length === 0}
              >
                {formSubmitted ? 'Update Selections' : 'Save Selections'}
              </button>
            </div>
          </div>
          
          {/* AI Insights Component - Updated */}
          {formSubmitted && (
            <div className="mt-16 bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex items-center mb-10">
                <svg className="w-8 h-8 mr-3 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.25 3L10.75 7L8.75 8.5L11.25 10.5L8.75 12.5L10.75 15L9.25 17H6.75L5.25 15L7.25 12.5L4.75 10.5L7.25 8.5L5.75 7L7.25 3H9.25Z" fill="currentColor"/>
                  <path d="M17.25 3L18.75 7L16.75 8.5L19.25 10.5L16.75 12.5L18.75 15L17.25 17H14.75L13.25 15L15.25 12.5L12.75 10.5L15.25 8.5L13.75 7L15.25 3H17.25Z" fill="currentColor"/>
                  <path d="M12 15C15.866 15 19 18.134 19 22H5C5 18.134 8.13401 15 12 15Z" fill="currentColor"/>
                </svg>
                <h2 className="text-3xl font-medium text-purple-700">AI-Powered Insights</h2>
              </div>
              
              {loadingAi && (
                <div className="flex flex-col items-center py-10">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mb-4"></div>
                  <p className="text-purple-700 text-lg">Generating AI insights...</p>
                </div>
              )}
              
              {aiError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700">{aiError}</p>
                  <button 
                    onClick={generateAIInsights}
                    className="mt-2 text-red-700 underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              
              {!loadingAi && !aiError && aiExpandedExperiences.length > 0 && (
              <div className="space-y-12">
                  {aiExpandedExperiences.map((item, expIndex) => (
                    <div key={item.experience._id} className="border-b pb-10 mb-10 last:border-b-0">
                      <h3 className="text-xl font-medium mb-4">
                        {expIndex + 1}. {item.experience.organization} – {item.experience.positionTitle}
                      </h3>
                      
                      <div className="space-y-8 mt-6">
                        {item.expansions.map((expansion, i) => (
                          <div 
                            key={expansion.id} 
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedExpansions[item.experience._id] === expansion.id 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                            onClick={() => handleSelectExpansion(item.experience._id, expansion.id)}
                          >
                            <div className="flex items-center mb-2">
                              <input 
                                type="radio"
                                checked={selectedExpansions[item.experience._id] === expansion.id}
                                onChange={() => handleSelectExpansion(item.experience._id, expansion.id)}
                                className="mr-2 h-4 w-4 text-purple-600"
                              />
                              <h4 className="font-medium">Option {i + 1}</h4>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{expansion.text}</p>
                  </div>
                ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={finalizeAiInsights}
                      className="px-6 py-3 bg-purple-600 text-white rounded-md font-medium flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Complete Section & Apply to Profile
                    </button>
              </div>
                </div>
              )}
              
              {!loadingAi && !aiError && aiExpandedExperiences.length === 0 && formSubmitted && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No AI expansions generated yet.</p>
                  <button
                    onClick={generateAIInsights}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md font-medium"
                  >
                    Generate AI Insights
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Success Alert */}
          {showAlert && (
            <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>{alertMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}