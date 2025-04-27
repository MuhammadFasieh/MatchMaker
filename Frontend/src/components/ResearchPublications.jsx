import { useState } from 'react';
import { Upload } from 'lucide-react';
import { research } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ResearchPublications() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); 
  const [progress, setProgress] = useState(45); 
  const [fileName, setFileName] = useState('');
  const [currentEntry, setCurrentEntry] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [researchEntries, setResearchEntries] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedEntry, setEditedEntry] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setIsUploading(true);
      setErrorMessage('');
      setCurrentStep(1); // Move to loading screen
      
      try {
        console.log('Processing file:', selectedFile.name, selectedFile.type, selectedFile.size);
        
        // Start progress animation
        simulateProcessing();
        
        // Upload CV to server
        console.log('Calling research.parseCV...');
        const response = await research.parseCV(selectedFile);
        console.log('Research API response:', response);
        
        if (response && response.success) {
          // Defensive: ensure data is always an array
          const researchProducts = Array.isArray(response.data) ? response.data : [];
          const formattedEntries = researchProducts.map(product => ({
            id: product._id,
            title: product.title,
            type: product.type,
            status: product.status,
            authors: product.authors,
            journal: product.journal,
            volume: product.volume,
            issue: product.issueNumber,
            pages: product.pages,
            pmid: product.pmid,
            month: product.monthPublished,
            year: product.yearPublished,
            pubmedEnriched: product.pubmedEnriched
          }));
          
          setResearchEntries(formattedEntries);
          setTotalEntries(formattedEntries.length);
          setCurrentEntry(1);
          
          // Let the progress animation finish
          setTimeout(() => {
            setCurrentStep(2); // Move to results screen
          }, 1000);
          
          toast.success(`${formattedEntries.length} research products extracted`);
        } else {
          setErrorMessage('Error parsing CV. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading CV:', error);
        setErrorMessage(`Error uploading CV: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const simulateProcessing = () => {
    setCurrentStep(1);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
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
    setErrorMessage('');
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
      setEditMode(false);
    } else {
      setEditedEntry({ ...researchEntries[currentEntry - 1] });
      setEditMode(true);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedEntry({
      ...editedEntry,
      [field]: value
    });
  };

  const handleSaveResearch = () => {
    // Logic to save all research entries
    toast.success('Research entries saved successfully!');
    // Here you would call an API endpoint to save all entries to the database
  };

  const renderEntryField = (field, label) => {
    const entry = researchEntries[currentEntry - 1];
    const value = entry[field] || '';
    const isPubMedEnriched = entry.pubmedEnriched && entry[field];
    
    return (
      <div className="py-3 border-b border-gray-200">
        <div className="font-bold mb-2">{label}:</div>
        <div className="relative">
          {editMode ? (
            <input
              type="text"
              value={editedEntry[field] || ''}
              onChange={(e) => handleEditChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ) : (
            <div className={`whitespace-pre-wrap ${isPubMedEnriched ? 'text-blue-600' : ''}`}>
              {value || 'N/A'}
              {isPubMedEnriched && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  PubMed
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
            
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center">
              <div className="text-gray-400 mb-4">
                <Upload size={40} />
              </div>
              
              <h2 className="text-xl font-medium text-gray-700 mb-2 text-center">Upload Your CV</h2>
              <p className="text-gray-500 mb-4 text-center">Accepted file formats: .pdf, .doc, .docx, .txt, .rtf</p>
              
              <label className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#197EAB] cursor-pointer hover:bg-[#156A8F]'} text-white py-2 px-6 rounded-md transition-colors flex items-center`}>
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Browse Files'
                )}
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt,.rtf" 
                  className="hidden" 
                  onChange={handleFileSelect}
                  disabled={isUploading}
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
                  onClick={handleSaveResearch} 
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