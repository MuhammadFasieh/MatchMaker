import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function ResearchPublications() {
  const [currentStep, setCurrentStep] = useState(0); 
  const [progress, setProgress] = useState(45); 
  const [fileName, setFileName] = useState('');
  const [currentEntry, setCurrentEntry] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [researchEntries, setResearchEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedEntry, setEditedEntry] = useState({});

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        processFileContent(event.target.result);
      };
      
      reader.readAsText(selectedFile);
      
      simulateProcessing();
    }
  };

  const processFileContent = (content) => {
    
    const lines = content.split('\n');
    const entries = [];
    
    let currentEntry = {};
    let entryStarted = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') continue;
      
      if (trimmedLine.toLowerCase().includes('title:') || 
          (trimmedLine.length > 10 && /[A-Z]/.test(trimmedLine[0]) && !entryStarted)) {
        
        if (Object.keys(currentEntry).length > 0) {
          entries.push(currentEntry);
        }
        
        currentEntry = {};
        entryStarted = true;
        currentEntry.title = trimmedLine.replace(/title:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('journal:')) {
        currentEntry.journal = trimmedLine.replace(/journal:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('author') || trimmedLine.toLowerCase().includes('authors:')) {
        currentEntry.authors = trimmedLine.replace(/authors?:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('volume:') || trimmedLine.toLowerCase().includes('vol:')) {
        currentEntry.volume = trimmedLine.replace(/volume?:\s*|vol:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('issue:')) {
        currentEntry.issue = trimmedLine.replace(/issue:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('pages:')) {
        currentEntry.pages = trimmedLine.replace(/pages:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('pmid:')) {
        currentEntry.pmid = trimmedLine.replace(/pmid:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('year:')) {
        currentEntry.year = trimmedLine.replace(/year:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('month:')) {
        currentEntry.month = trimmedLine.replace(/month:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('type:') || trimmedLine.toLowerCase().includes('publication type:')) {
        currentEntry.type = trimmedLine.replace(/(?:publication\s*)?type:\s*/i, '');
      }
      else if (trimmedLine.toLowerCase().includes('status:')) {
        currentEntry.status = trimmedLine.replace(/status:\s*/i, '');
      }
    }
    
    if (Object.keys(currentEntry).length > 0) {
      entries.push(currentEntry);
    }
    
    if (entries.length === 0) {
      entries.push({
        title: "Unable to parse specific entries",
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        type: "Document content"
      });
    }
    
    setResearchEntries(entries);
    setTotalEntries(entries.length);
  };

  const simulateProcessing = () => {
    setCurrentStep(1);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setCurrentStep(2);
      }
    }, 200);
  };

  const reuploadCV = () => {
    setCurrentStep(0);
    setFileName('');
    setResearchEntries([]);
    setProgress(45);
    setCurrentEntry(1);
    setTotalEntries(0);
    setEditMode(false);
    setEditedEntry({});
  };

  const handlePrevEntry = () => {
    if (currentEntry > 1) {
      if (editMode) {
        saveCurrentEntryChanges();
      }
      setCurrentEntry(currentEntry - 1);
      setEditMode(false);
    }
  };

  const handleNextEntry = () => {
    if (currentEntry < totalEntries) {
      if (editMode) {
        saveCurrentEntryChanges();
      }
      setCurrentEntry(currentEntry + 1);
      setEditMode(false);
    }
  };

  const saveCurrentEntryChanges = () => {
    const updatedEntries = [...researchEntries];
    updatedEntries[currentEntry - 1] = { ...editedEntry };
    setResearchEntries(updatedEntries);
  };

  const toggleEditMode = () => {
    if (editMode) {
      saveCurrentEntryChanges();
    } else {
      setEditedEntry({ ...researchEntries[currentEntry - 1] });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditedEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveAllChanges = () => {
    if (editMode) {
      saveCurrentEntryChanges();
      setEditMode(false);
    }
    
    console.log("Data ready for API submission:", researchEntries);
    alert("Data saved successfully!");
  };

  const renderEntryField = (fieldName, label) => {
    const currentEntryData = researchEntries[currentEntry - 1];
    
    if (editMode) {
      return (
        <div className="grid grid-cols-6 py-3 border-b border-gray-200 md:grid-cols-6">
          <div className="col-span-2 font-bold">{label}</div>
          <div className="col-span-4">
            <input
              type="text"
              value={editedEntry[fieldName] || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      );
    } else {
      const isIncomplete = fieldName === 'year' && !currentEntryData[fieldName];
      return (
        <div className="flex flex-col md:grid md:grid-cols-6 py-3 border-b border-gray-200">
          <div className="font-bold mb-1 md:col-span-2 md:mb-0">{label}</div>
          <div className={`md:col-span-4 ${isIncomplete ? " flex items-center" : ""}`}>
            {currentEntryData[fieldName] ? 
              currentEntryData[fieldName] : 
              isIncomplete ? 
                <>
                  Not specified
                </> : 
                "Not specified"
            }
          </div>
        </div>
      );
    }
  };

  return (
    <>
    <h1 className='text-[#197EAB] text-[36px] text-center pt-[3rem]' style={{fontWeight:500}}>Research & Publications</h1>
    <div className="flex justify-center items-center h-fit my-[5rem]  mx-[1rem]">
      <div className="w-full max-w-3xl mx-4">
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl font-medium text-[#197EAB] mb-6 text-center">Upload Your CV</h1>
            
            <p className="text-gray-700 text-center mb-8">
              Please upload your CV here. Make sure it includes all of your research products 
              (publications, abstracts, presentations, etc.) along with their citation.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center">
              <div className="text-gray-400 mb-4">
                <Upload size={40} />
              </div>
              
              <h2 className="text-xl font-medium text-gray-700 mb-2 text-center">Upload Your CV</h2>
              <p className="text-gray-500 mb-4 text-center">Accepted file formats: .pdf, .doc, .docx, .txt, .rtf</p>
              
              <label className="bg-[#197EAB] text-white py-2 px-6 rounded-md cursor-pointer transition-colors">
                Browse Files
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt,.rtf" 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
              </label>
              
              <p className="text-gray-500 mt-6">Max size: 10MB</p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4A90E2"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                  {progress}%
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">Analyzing your CV...</h2>
            <p className="text-gray-600">extracting your research products</p>
          </div>
        )}

        {currentStep === 2 && researchEntries.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 lg:p-12">
            <div className="mb-6">
              <p className="text-lg font-bold">Uploaded File: <span className="font-normal">{fileName}</span></p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-bold">Research Entry {currentEntry}:</p>
                <button 
                  onClick={toggleEditMode} 
                  className="text-[#197EAB] flex items-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {editMode ? "Save Entry" : "Edit"}
                </button>
              </div>
              
              <div className="border-t border-gray-200">
                {researchEntries[currentEntry - 1].content ? (
                  <div className="py-3 border-b border-gray-200">
                    <div className="font-bold mb-2">Document Content:</div>
                    <div className="whitespace-pre-wrap">{researchEntries[currentEntry - 1].content}</div>
                  </div>
                ) : (
                  <>
                    {renderEntryField('title', 'Title')}
                    {renderEntryField('type', 'Type')}
                    {renderEntryField('status', 'Status')}
                    {renderEntryField('authors', 'Authors')}
                    {renderEntryField('journal', 'Journal')}
                    {renderEntryField('volume', 'Vol')}
                    {renderEntryField('issue', 'Issue')}
                    {renderEntryField('pages', 'Pages')}
                    {renderEntryField('pmid', 'PMID')}
                    {renderEntryField('month', 'Month')}
                    {renderEntryField('year', 'Year')}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col mt-8 md:flex-row md:justify-between">
              <div className="flex items-center justify-center text-gray-600 mb-4 md:mb-0">
                <button 
                  onClick={handlePrevEntry} 
                  disabled={currentEntry <= 1}
                  className={`mr-2 ${currentEntry <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="cursor-pointer h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="border border-gray-300 rounded-md px-3 py-1 bg-white">{currentEntry}</span>
                <span className="mx-2">of {totalEntries} Results</span>
                <button 
                  onClick={handleNextEntry}
                  disabled={currentEntry >= totalEntries}
                  className={`${currentEntry >= totalEntries ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="cursor-pointer h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                <button onClick={reuploadCV} className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors w-full md:w-auto">
                  Re-upload CV
                </button>
                <button 
                  onClick={saveAllChanges} 
                  className="bg-[#197EAB] text-white py-2 px-4 rounded-md transition-colors w-full md:w-auto cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>

  );
}