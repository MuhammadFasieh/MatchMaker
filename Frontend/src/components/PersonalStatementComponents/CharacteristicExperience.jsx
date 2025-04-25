import React, { useState } from "react";

const CharacteristicExperience = ({
  step,
  totalSteps = 9,
  progress,
  characteristicNumber,
  characteristic,
  onNext,
  onBack
}) => {
  const [experience, setExperience] = useState("");
  
  const handleTextChange = (e) => {
    setExperience(e.target.value);
  };
  
  const handleNext = () => {
    if (experience.trim() === "") {
      alert("Please describe your experience");
      return;
    }
    
    if (onNext) {
      onNext(experience);
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
        For <span className="text-[#197EAB]">{characteristic}</span>, write about a time in your life, preferably during medical school, when you displayed this characteristic.
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Don't worry about the writing style, we'll make you sound good later 😉
      </p>
      
      {/* Text Area */}
      <div className="flex-1 mb-6">
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-md text-gray-700 text-[16px]"
          placeholder={`Describe a specific experience that demonstrates your ${characteristic?.toLowerCase()}...`}
          value={experience}
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

export default CharacteristicExperience; 