import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { personalStatement, dashboard } from "../../services/api";

const PersonalStatementSuccess = ({
  step = 9,
  totalSteps = 9,
  progress = 100,
  onBack,
  onFinish
}) => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProofread, setIsProofread] = useState(false);
  
  const handlePreviewDraft = () => {
    // Go back to the preview screen
    if (onBack) {
      onBack();
    }
  };
  
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    
    try {
      // Use the API service for downloading the PDF
      personalStatement.downloadPDF();
      
      // We don't need to wait for the download to complete
      // as it's handled by the browser
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
      setIsDownloading(false);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log("Starting comprehensive personal statement completion process");
      
      // Method 1: Direct completion through personal statement API
      try {
        const directResponse = await personalStatement.markComplete();
        console.log("1. Direct completion response:", directResponse);
      } catch (err) {
        console.warn("Direct completion failed, continuing with other methods:", err);
      }
      
      // Method 2: Section progress update via dashboard API
      try {
        const dashboardResponse = await dashboard.updateSectionProgress('personalStatement', true);
        console.log("2. Dashboard update response:", dashboardResponse);
      } catch (err) {
        console.warn("Dashboard update failed, continuing with other methods:", err);
      }
      
      // Method 3: Double-confirmation after a delay
      setTimeout(async () => {
        try {
          // Try direct method again
          const secondDirectResponse = await personalStatement.markComplete();
          console.log("3. Second direct completion response:", secondDirectResponse);
          
          // Try dashboard method again
          const secondDashboardResponse = await dashboard.updateSectionProgress('personalStatement', true);
          console.log("4. Second dashboard update response:", secondDashboardResponse);
          
          // Refresh dashboard data to update UI
          const dashboardData = await dashboard.getDashboardData();
          console.log("5. Final dashboard refresh:", dashboardData);
          
          // Navigate to dashboard
          if (onFinish) {
            onFinish();
          } else {
            navigate("/dashboard");
          }
        } catch (innerError) {
          console.error("Error in final completion sequence:", innerError);
          
          // Even if there's an error, try to navigate away
          if (onFinish) {
            onFinish();
          } else {
            navigate("/dashboard");
          }
        } finally {
          setIsSubmitting(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Top-level error in completion process:", error);
      alert("There was an issue completing your personal statement. Your progress has been saved, but you may need to mark it as complete from the dashboard.");
      setIsSubmitting(false);
      
      // Try to navigate anyway after error
      setTimeout(() => {
        if (onFinish) {
          onFinish();
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    }
  };
  
  return (
    <div className="rounded-2xl shadow-xl md:p-6 p-4 md:h-[720px] lg:w-[928px] w-full mx-auto flex flex-col bg-white max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
          <div
            className="bg-[#197EAB] h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-green-100 rounded-full p-4 mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your draft personal statement has been successfully generated!
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-lg">
          Based on your answers and selected thesis statement, we've created a personalized draft.
          You can now review, edit, or download your personal statement.
        </p>
        
        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-8">
          <button
            onClick={handlePreviewDraft}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-[#197EAB] text-[#197EAB] rounded-lg p-4 hover:bg-blue-50 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
              />
            </svg>
            <span>Preview Draft</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex items-center justify-center space-x-2 bg-white border-2 border-[#197EAB] text-[#197EAB] rounded-lg p-4 hover:bg-blue-50 transition-colors ${
              isDownloading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isDownloading ? (
              <svg 
                className="animate-spin h-5 w-5 text-[#197EAB]" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            )}
            <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
          </button>
        </div>
        
        {/* Disclaimer checkbox */}
        <div className="flex items-start mb-8 text-left">
          <input
            type="checkbox"
            id="proofread"
            checked={isProofread}
            onChange={() => setIsProofread(!isProofread)}
            className="mt-1 h-4 w-4 text-[#197EAB] border-gray-300 rounded"
          />
          <label htmlFor="proofread" className="ml-2 text-gray-600 text-sm">
            Make sure to proofread and personalize your final statement before
            submitting it with your application.
          </label>
        </div>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-[#197EAB] text-white px-8 py-3 rounded-md ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Final Statement"}
        </button>
      </div>
    </div>
  );
};

export default PersonalStatementSuccess; 