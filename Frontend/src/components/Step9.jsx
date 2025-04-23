import React, { useState } from "react";

export default function Step9() {
  const progress = 100;
  const [isChecked, setIsChecked] = useState(false);
  
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="p-6 bg-white font-sans lg:w-[928px] w-full max-w-full mx-auto rounded-2xl shadow-xl mb-[3rem]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Step 9 of 9</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
        <div
          className="bg-[#197EAB] h-4 rounded-full border-3 border-gray-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Success message */}
      <div className="mb-8 mt-4">
        <h2 className="text-[18px] text-[#000000]" style={{ fontWeight: 600 }}>
          Your draft personal statement has been successfully generated!
        </h2>
        <p className="text-[18px] text-[#000000] mt-4" style={{ fontWeight: 600 }}>
          Based on your answers and selected thesis statement, we've created a personalized draft.
        </p>
        <p className="text-[18px] text-[#000000] mt-4" style={{ fontWeight: 600 }}>
          You can now review, edit, or download your personal statement.
        </p>
      </div>
      
      {/* Action buttons - Mobile friendly */}
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-center lg:gap-8 mb-8">
        <button className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-6 w-full lg:w-64 lg:h-48">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 36V12H28L36 20V36H12Z" stroke="black" strokeWidth="2" />
              <path d="M28 12V20H36" stroke="black" strokeWidth="2" />
              <path d="M20 24L24 28L32 20" stroke="black" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-xl font-medium">Preview Draft</span>
        </button>
        
        <button className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-6 w-full lg:w-64 lg:h-48">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12V30" stroke="black" strokeWidth="2" />
              <path d="M16 22L24 30L32 22" stroke="black" strokeWidth="2" />
              <path d="M12 36H36" stroke="black" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-xl font-medium">Download PDF</span>
        </button>
      </div>
      
      {/* Disclaimer with checkbox */}
      <div className="mb-8">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="mt-1 mr-3"
          />
          <span className="text-[16px] text-[#197EAB]" style={{ fontWeight: 400 }}>
            Make sure to proofread and personalize your final statement before submitting it with your application.
          </span>
        </label>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <button className="bg-[#197EAB] text-white py-3 rounded-md w-24">
          Submit
        </button>
      </div>
    </div>
  );
}