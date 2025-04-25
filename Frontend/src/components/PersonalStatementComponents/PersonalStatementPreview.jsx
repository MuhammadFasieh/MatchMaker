import React, { useState } from "react";
import PersonalStatementEdit from "./PersonalStatementEdit";

const PersonalStatementPreview = ({
  step = 8,
  totalSteps = 9,
  progress = 88,
  personalStatement = "",
  isLoading = false,
  wordCount = 0,
  onBack,
  onFinish,
  onEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatement, setEditedStatement] = useState(personalStatement);
  
  // Word count calculation
  const calculateWordCount = (text) => {
    return text.split(/\s+/).filter(Boolean).length;
  };
  
  const wordLimit = 750;
  const actualWordCount = wordCount || calculateWordCount(editedStatement);
  const isOverLimit = actualWordCount > wordLimit;
  
  // Handle entering edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle saving edited statement
  const handleSaveEdit = (newStatement) => {
    setEditedStatement(newStatement);
    setIsEditing(false);
    
    // Call external handler if provided
    if (onEdit) {
      onEdit(newStatement);
    }
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // If in edit mode, show the edit component
  if (isEditing) {
    return (
      <PersonalStatementEdit
        step={step}
        totalSteps={totalSteps}
        progress={progress}
        initialStatement={editedStatement}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }
  
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
      
      {/* Title and Word Count */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[20px] text-gray-800" style={{ fontWeight: 600 }}>
          Your Personal Statement
        </h2>
        <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {actualWordCount} / {wordLimit} words
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197EAB]"></div>
          <p className="ml-4 text-[#197EAB]">Generating your personal statement...</p>
        </div>
      ) : (
        <>
          {/* Personal Statement Preview */}
          <div className="flex-1 overflow-y-auto border border-gray-300 rounded-md p-4 bg-white mb-4">
            {editedStatement.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-800">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Warning if over word limit */}
          {isOverLimit && (
            <p className="text-red-500 text-sm mb-4">
              Your personal statement exceeds the 750 word limit. Consider editing to reduce length.
            </p>
          )}
        </>
      )}
      
      {/* Navigation Buttons */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={onBack}
          className="border border-[#197EAB] text-[#197EAB] px-8 py-3 rounded-md"
        >
          Back
        </button>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className={`border border-[#197EAB] text-[#197EAB] px-8 py-3 rounded-md ${
              isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => {
              const element = document.createElement("a");
              const file = new Blob([editedStatement], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = "personal_statement.txt";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            disabled={isLoading}
            className={`px-8 py-3 rounded-md ${
              isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-700"
            }`}
          >
            Download
          </button>
          <button
            onClick={() => onFinish(editedStatement)}
            disabled={isLoading}
            className={`px-8 py-3 rounded-md ${
              isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#197EAB] text-white"
            }`}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalStatementPreview; 