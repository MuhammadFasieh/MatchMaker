import React, { useState } from "react";

const Step8 = ({
  onSubmit = () => {} // Added callback for form submission
}) => {
  // Structure options - in a real implementation, these would come from props or API
  const structureItems = [
    "Body Paragraph 1: Story showing Characteristic #1",
    "Body Paragraph 3: Story showing Characteristic #3"
  ];
  
  const staticItems = [
    "Intro Paragraph: Introduce applicant + desire to pursue selected specialty",
    "Thesis Statement Paragraph: Why they are a strong fit, why their traits matter",
    "Body Paragraph 2: Story showing Characteristic #2",
    "Conclusion: Express excitement and reinforce candidacy",
    "Word Limit: 750"
  ];

  const [checkedItems, setCheckedItems] = useState(Array(structureItems.length).fill(false));

  const handleCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const handleButtonClick = () => {
    // Get selected structure items
    const selectedItems = structureItems.filter((_, index) => checkedItems[index]);
    
    // Create complete structure with both static and selected items
    const completeStructure = [
      staticItems[0],
      staticItems[1],
      checkedItems[0] ? structureItems[0] : null,
      staticItems[2],
      checkedItems[1] ? structureItems[1] : null,
      staticItems[3],
      staticItems[4]
    ].filter(item => item !== null);
    
    // Create data object to be sent to backend
    const formData = {
      step: 8,
      question: "Personal Statement Structure Selection",
      selectedStructureItems: selectedItems,
      completeStructure: completeStructure,
      timestamp: new Date().toISOString()
    };
    
    // Log the data to console
    console.log("Form submission data:", formData);
    
    // Call the onSubmit callback with the structure data
    onSubmit({
      selectedItems,
      completeStructure
    });
  };

  const progress = 88;

  return (
    <div className="rounded-2xl shadow-xl p-6 lg:w-[928px] w-full max-w-full flex flex-col bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Step 8 of 9</span>
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
      <div className="mb-4">
        <h2 className="text-[18px] text-[#000000]" style={{ fontWeight: 600 }}>
          Based on your selected thesis statement and stories, we will now generate a draft of
          your personal statement. You will be able to edit it further before submission.
        </h2>
      </div>

      {/* Textarea */}
      <div className="font-sans">
        <h1 className="text-[16px] text-[#FF0000] mb-6" style={{ fontWeight: 400 }}>
          Structure Sent to OpenAI for Drafting:
        </h1>

        <div className="ml-2 space-y-6">
          <div className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
            <p>
              {staticItems[0]}
            </p>
          </div>

          <div className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
            <p>
              {staticItems[1]}
            </p>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="item3"
              checked={checkedItems[0]}
              onChange={() => handleCheckboxChange(0)}
              className="mr-3 mt-1"
            />
            <label htmlFor="item3" className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
              {structureItems[0]}
            </label>
          </div>

          <div className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
            <p>
              {staticItems[2]}
            </p>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="item5"
              checked={checkedItems[1]}
              onChange={() => handleCheckboxChange(1)}
              className="mr-3 mt-1"
            />
            <label htmlFor="item5" className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
              {structureItems[1]}
            </label>
          </div>

          <div className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
            <p>
              {staticItems[3]}
            </p>
          </div>

          <div className="text-[16px] text-[#FF0000]" style={{ fontWeight: 400 }}>
            <p>{staticItems[4]}</p>
          </div>
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

export default Step8;