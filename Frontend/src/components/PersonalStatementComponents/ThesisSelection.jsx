import React, { useState, useEffect } from "react";

const ThesisSelection = ({
  step = 7,
  totalSteps = 9,
  progress = 77,
  thesisStatements = [],
  isLoading = false,
  onNext,
  onBack
}) => {
  const [selectedThesis, setSelectedThesis] = useState(null);
  
  const handleThesisSelect = (index) => {
    setSelectedThesis(index);
  };
  
  const handleNext = () => {
    if (selectedThesis === null) {
      alert("Please select a thesis statement");
      return;
    }
    
    if (onNext) {
      onNext(thesisStatements[selectedThesis]);
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
      
      {/* Form Question */}
      <h2 className="text-[18px] text-gray-800 mb-2" style={{ fontWeight: 600 }}>
        Which one of the following thesis statements do you most resonate with?
      </h2>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197EAB]"></div>
          <p className="ml-4 text-[#197EAB]">Generating thesis statements...</p>
        </div>
      ) : (
        <>
          {/* Thesis Statements */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {thesisStatements.map((thesis, index) => (
              <div
                key={index}
                className={`border p-4 rounded-md cursor-pointer transition-all ${
                  selectedThesis === index 
                    ? "border-[#197EAB] bg-[#197EAB10]" 
                    : "border-gray-300 hover:border-[#197EAB]"
                }`}
                onClick={() => handleThesisSelect(index)}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-1 flex items-center justify-center ${
                    selectedThesis === index 
                      ? "border-[#197EAB] bg-[#197EAB]" 
                      : "border-gray-400"
                  }`}>
                    {selectedThesis === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-800">{thesis}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="border border-[#197EAB] text-[#197EAB] px-8 py-3 rounded-md w-24"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading || selectedThesis === null}
          className={`px-8 py-3 rounded-md w-24 ${
            isLoading || selectedThesis === null
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#197EAB] text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ThesisSelection; 