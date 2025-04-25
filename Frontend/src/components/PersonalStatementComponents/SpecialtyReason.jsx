import React, { useState } from "react";

const SpecialtyReason = ({
  step = 2,
  totalSteps = 9,
  progress = 22,
  selectedSpecialties = [],
  onNext,
  onBack
}) => {
  const [reason, setReason] = useState("");
  
  const handleTextChange = (e) => {
    setReason(e.target.value);
  };
  
  const handleNext = () => {
    if (reason.trim() === "") {
      alert("Please provide a reason for your choice");
      return;
    }
    
    if (onNext) {
      onNext(reason);
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
      <h2 className="text-[18px] text-gray-800 mb-4" style={{ fontWeight: 600 }}>
        What made you decide to apply to {selectedSpecialties.length > 0 ? 
          selectedSpecialties.join(', ') : 
          "this specialty"}?
      </h2>
      
      {/* Text Area */}
      <div className="flex-1 mb-6">
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-md text-gray-700 text-[16px]"
          placeholder="Share your motivation and journey that led you to choose this specialty..."
          value={reason}
          onChange={handleTextChange}
        />
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-auto flex justify-between">
        <button
          onClick={onBack}
          className="border border-[#197EAB] text-[#197EAB] px-8 py-3 rounded-md w-24"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#197EAB] text-white px-8 py-3 rounded-md w-24"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SpecialtyReason; 