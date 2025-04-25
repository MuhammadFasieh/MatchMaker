import React, { useState, useEffect } from "react";

const PersonalStatementEdit = ({
  step,
  totalSteps,
  progress,
  initialStatement = "",
  onSave,
  onCancel
}) => {
  const [statement, setStatement] = useState(initialStatement);
  const [wordCount, setWordCount] = useState(0);
  const wordLimit = 750;
  
  // Calculate word count on load and when statement changes
  useEffect(() => {
    const count = statement.split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, [statement]);
  
  const handleChange = (e) => {
    setStatement(e.target.value);
  };
  
  const handleSave = () => {
    if (wordCount > wordLimit) {
      if (!window.confirm(`Your statement exceeds the ${wordLimit} word limit. Do you want to continue anyway?`)) {
        return;
      }
    }
    
    if (onSave) {
      onSave(statement);
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
      
      {/* Title and Word Count */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[20px] text-gray-800" style={{ fontWeight: 600 }}>
          Edit Your Personal Statement
        </h2>
        <div className={`text-sm ${wordCount > wordLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {wordCount} / {wordLimit} words
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-hidden mb-4">
        <textarea
          value={statement}
          onChange={handleChange}
          className="w-full h-full p-4 border border-gray-300 rounded-md text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#197EAB] focus:border-transparent"
          placeholder="Edit your personal statement here..."
        />
      </div>
      
      {/* Warning if over word limit */}
      {wordCount > wordLimit && (
        <p className="text-red-500 text-sm mb-4">
          Your personal statement exceeds the {wordLimit} word limit. Consider editing to reduce length.
        </p>
      )}
      
      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="border border-[#197EAB] text-[#197EAB] px-8 py-3 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-[#197EAB] text-white px-8 py-3 rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PersonalStatementEdit; 