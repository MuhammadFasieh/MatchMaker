import React, { useState } from "react";

const PersonalStatement2 = ({
  step = 1,
  totalSteps = 9,
  progress = 11,
  title = "Tell us about a time during medical school when you demonstrated [Characteristic #1].",
  subtitle = "(Don't worry about perfect wording—we'll help you polish it later.)",
  textareaPlaceholder = "Answer Here ...",
  buttonText = "Next",
  onSubmit = () => {}, // Callback for form submission
}) => {
  // State to manage textarea value
  const [textareaValue, setTextareaValue] = useState("");
  
  // Handle textarea change
  const handleTextareaChange = (e) => {
    setTextareaValue(e.target.value);
  };
  
  // Handle form submission (button click)
  const handleButtonClick = () => {
    // Create data object to be sent to backend
    const formData = {
      step,
      question: title,
      answer: textareaValue,
      timestamp: new Date().toISOString()
    };
    
    // Log the data to console
    console.log("Form submission data:", formData);
    
    // Call the onSubmit callback with the textarea value
    onSubmit(textareaValue);
  };
  
  return (
    <div className="rounded-2xl shadow-xl md:p-6 p-4 md:h-[413px] md:w-[928px] w-full mx-auto flex flex-col bg-white max-w-full ">
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
      <div className="mb-6">
        <h2 className="text-[18px] text-[#000000]" style={{ fontWeight: 600 }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[16px] text-[#197EAB] mt-2" style={{ fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Textarea */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          placeholder={textareaPlaceholder}
          value={textareaValue}
          onChange={handleTextareaChange}
          className="w-full h-64 md:h-32 p-4 border border-gray-300 rounded-md text-gray-700 text-[16px]"
          style={{ fontWeight: 400 }}
        />
      </div>
      
      {/* Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleButtonClick}
          className="bg-[#197EAB] text-white px-8 py-3 rounded-md w-24"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PersonalStatement2;