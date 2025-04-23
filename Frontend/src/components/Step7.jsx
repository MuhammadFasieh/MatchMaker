import React, { useState } from "react";

const Step7 = ({
  onSubmit = () => {} // Added callback for form submission
}) => {
  // Sample thesis statements - in a real implementation, these would come from props or API
  const thesisStatements = [
    "My passion for internal medicine lies in its complexity and the opportunity to connect deeply with patients, which aligns with my empathetic and adaptable nature.",
    "I am drawn to pediatrics because it combines medical skill with emotional intelligence—skills I've developed as a compassionate and resourceful student."
  ];

  const [checkedItems, setCheckedItems] = useState(Array(thesisStatements.length).fill(false));

  const handleCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const handleButtonClick = () => {
    // Get selected thesis statements
    const selectedTheses = thesisStatements.filter((_, index) => checkedItems[index]);
    
    // Create data object to be sent to backend
    const formData = {
      step: 7,
      question: "Thesis Statement Selection",
      selectedTheses: selectedTheses,
      selectedIndices: checkedItems.map((checked, index) => checked ? index : null).filter(index => index !== null),
      timestamp: new Date().toISOString()
    };
    
    // Log the data to console
    console.log("Form submission data:", formData);
    
    // Call the onSubmit callback with the selected thesis statements
    onSubmit(selectedTheses);
  };

  const progress = 77;

  return (
    <div className="rounded-2xl shadow-xl p-6 lg:w-[928px] w-full max-w-full flex flex-col bg-white">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Step 7 of 9</span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
          <div
            className="bg-[#197EAB] h-4 rounded-full border-3 border-gray-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Form Question */}
      <div className="mt-4">
        <h2 className="text-[18px] text-[#000000]" style={{ fontWeight: 600 }}>
          We're generating 5 possible thesis statements based on your answers
          using OpenAI. Choose the one that best reflects your story and voice.
        </h2>
      </div>

      {/* Thesis Statements */}
      <div className="font-sans mt-4">
        <h1 className="text-[16px] font-normal text-[#FF0000]" style={{ fontWeight: 400 }}>
          Display:
        </h1>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="mr-1">🧠</span>
            <span className="text-[16px] font-normal text-[#FF0000]" style={{ fontWeight: 400 }}>
              5 thesis statements in short sentence format (1–2 sentences each)
            </span>
          </div>
        </div>
        <h2 className="text-[16px] font-normal text-[#FF0000] mt-4" style={{ fontWeight: 400 }}>
          Virtual Answer Example:
        </h2>
        <div className="mt-4 space-y-6">
          {thesisStatements.map((thesis, index) => (
            <div key={index} className="flex items-start">
              <input
                type="checkbox"
                id={`thesis${index + 1}`}
                checked={checkedItems[index]}
                onChange={() => handleCheckboxChange(index)}
                className="mt-1 mr-3"
              />
              <label 
                htmlFor={`thesis${index + 1}`} 
                className="text-[16px] font-normal text-[#FF0000]" 
                style={{ fontWeight: 400 }}
              >
                {index + 1}. "{thesis}"
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleButtonClick}
          className="bg-[#197EAB] text-white px-8 py-3 rounded-md w-24"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step7;