import React, { useState, useEffect } from "react";

const CharacteristicsSelect = ({
  step = 3,
  totalSteps = 9,
  progress = 33,
  onNext,
  onBack
}) => {
  const [selectedCharacteristics, setSelectedCharacteristics] = useState([]);
  const [error, setError] = useState("");
  
  const characteristics = [
    "Adaptability",
    "Analytical Thinking",
    "Attention to Detail",
    "Collaboration",
    "Communication Skills",
    "Compassion",
    "Critical Thinking",
    "Cultural Competence",
    "Dedication",
    "Empathy",
    "Ethical Judgment",
    "Initiative",
    "Innovation",
    "Leadership",
    "Patient Advocacy",
    "Problem-Solving",
    "Professionalism",
    "Research Skills",
    "Resilience",
    "Technical Proficiency"
  ];
  
  const handleCheckboxChange = (characteristic) => {
    // If already selected, remove it
    if (selectedCharacteristics.includes(characteristic)) {
      setSelectedCharacteristics(
        selectedCharacteristics.filter(c => c !== characteristic)
      );
      setError("");
      return;
    }
    
    // If trying to select more than 3 characteristics
    if (selectedCharacteristics.length >= 3) {
      setError("Please select only 3 characteristics");
      return;
    }
    
    // Add the new characteristic
    setSelectedCharacteristics([...selectedCharacteristics, characteristic]);
    setError("");
  };
  
  const handleNext = () => {
    if (selectedCharacteristics.length !== 3) {
      setError("Please select exactly 3 characteristics");
      return;
    }
    
    if (onNext) {
      onNext(selectedCharacteristics);
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
        From the list below, select 3 characteristics that you would like to highlight in your personal statement
      </h2>
      
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      
      {/* Selected Characteristics Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedCharacteristics.map((char, index) => (
          <div key={index} className="bg-[#197EAB] text-white px-3 py-1 rounded-full text-sm flex items-center">
            {char}
            <button 
              onClick={() => handleCheckboxChange(char)}
              className="ml-2 text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      {/* Characteristics List */}
      <div className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-2 w-full flex-grow mb-4 md:pr-2 flex flex-col space-y-4 md:space-y-0 overflow-y-auto">
        {characteristics.map((characteristic, index) => (
          <label
            key={index}
            className={`flex items-center space-x-3 md:space-x-2 text-[#000000] text-[16px] ${
              selectedCharacteristics.includes(characteristic) ? "text-[#197EAB] font-medium" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCharacteristics.includes(characteristic)}
              onChange={() => handleCheckboxChange(characteristic)}
              className="h-4 w-4 text-[#197EAB] border-gray-300 rounded"
            />
            <span>{characteristic}</span>
          </label>
        ))}
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

export default CharacteristicsSelect; 