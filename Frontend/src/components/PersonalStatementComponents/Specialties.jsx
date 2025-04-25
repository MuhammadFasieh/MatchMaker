import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Specialties = ({
  step = 1,
  totalSteps = 9,
  progress = 11,
  onNext
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const navigate = useNavigate();
  
  const specialties = [
    "Internal Medicine",
    "Pediatrics",
    "Surgery",
    "Psychiatry",
    "Family Medicine",
    "Emergency Medicine",
    "Obstetrics and Gynecology (OB/GYN)",
    "Neurology",
    "Dermatology",
    "Radiology",
    "Orthopedic Surgery",
    "Anesthesiology",
    "Ophthalmology",
    "Pathology",
    "Physical Medicine & Rehabilitation"
  ];

  const handleCheckboxChange = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((s) => s !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) {
      alert("Please select at least one specialty");
      return;
    }
    
    // Save data to context or pass to parent
    if (onNext) {
      onNext(selectedOptions);
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
        Which specialty will this personal statement be going to? 
        <span className="text-sm text-gray-500 block md:inline mt-2 md:mt-0">
          (Can select multiple)
        </span>
      </h2>

      {/* Options Checkboxes */}
      <div className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-2 w-full flex-grow mb-4 md:pr-2 flex flex-col space-y-4 md:space-y-0 overflow-y-auto">
        {specialties.map((option, index) => (
          <label
            key={index}
            className="flex items-center space-x-3 md:space-x-2 text-[#000000] text-[16px]"
            style={{ fontWeight: 400 }}
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="h-4 w-4 text-[#197EAB] border-gray-300 rounded"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {/* Button */}
      <div className="mt-auto flex justify-end">
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

export default Specialties; 