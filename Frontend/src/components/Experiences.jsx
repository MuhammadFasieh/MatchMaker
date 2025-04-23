import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
  const fileInputRef = useRef(null);

  // Medical Experiences State
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [expansionNotes, setExpansionNotes] = useState(
    '"Highlight research contribution and personal growth"\n"Emphasize my exposure to emergency medicine and decision-making"\n"Show how this work impacted my view on service and leadership"'
  );
  const [charCount, setCharCount] = useState(231);
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    if (file) {
      setFileName(file.name);
      setStage('analyzing');
      
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      try {
        const parsedExperiences = await parseCV(file);
        setExperiences(parsedExperiences);
        setTotalPages(parsedExperiences.length);
        setFormData(parsedExperiences[0]);
        
        setTimeout(() => {
          clearInterval(progressInterval);
          setProgress(100);
          setTimeout(() => {
            setStage('form');
          }, 500);
        }, 2000);
      } catch (error) {
        console.error("Error parsing CV:", error);
        clearInterval(progressInterval);
        alert("There was an error parsing your CV. Please try again.");
        setStage('upload');
      }
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

  const handleSaveChanges = () => {
    console.log('Saved data:', experiences);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

  const handleSaveMedicalExperiences = () => {
    const medicalFormData = {
      selectedExperiences,
      expansionNotes
    };
    
    console.log('Medical experiences form data saved:', medicalFormData);
    
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
    
    setFormSubmitted(true);
  };

  useEffect(() => {
    if (experiences.length > 0 && currentPage <= experiences.length) {
      setFormData(experiences[currentPage - 1]);
    }
  }, [currentPage, experiences]);

  const handleReuploadCV = () => {
    setStage('upload');
  };

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
            
            {/* Checkboxes */}
            <div className="space-y-4 mb-8">
              {medicalExperiences.map(exp => (
                <div key={exp.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={exp.id}
                    checked={selectedExperiences.includes(exp.id)}
                    onChange={() => handleExperienceToggle(exp.id)}
                    className="h-5 w-5 text-[#197EAB] border-gray-300 rounded"
                  />
                  <label htmlFor={exp.id} className="ml-3 text-lg text-gray-800">
                    {exp.label}
                  </label>
                </div>
              ))}
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
              >
                Save Changes
              </button>
            </div>
          </div>
          
          {/* AI Insights Component */}
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
              
              <div className="space-y-12">
                {medicalExperiences.filter(exp => selectedExperiences.includes(exp.id)).map((exp, index) => (
                  <div key={exp.id}>
                    <h3 className="text-xl font-medium mb-4">{index + 1}. {exp.label}</h3>
                    <p className="text-lg text-purple-700 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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