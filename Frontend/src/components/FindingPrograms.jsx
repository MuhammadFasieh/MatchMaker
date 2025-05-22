import React, { useState, useEffect } from "react";
import { programPreferences } from "../services/api";
import { useNavigate } from "react-router-dom";

const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function FindingPrograms() {
  const navigate = useNavigate();
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Added form data state to store all inputs
  const [formData, setFormData] = useState({
    onlySearchingSpecialty: null,
    otherSpecialties: "",
    selectedStates: [],
    preferredHospitalType: "",
    preferredResidentCount: "",
    valuedCharacteristics: [],
  });

  // Fetch existing preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await programPreferences.get();
        
        if (response && response.success && response.data) {
          // Map backend data to frontend format
          const preferences = response.data;
          
          // Set form data from API response
          setFormData({
            onlySearchingSpecialty: preferences.primarySpecialty ? true : false,
            otherSpecialties: preferences.otherSpecialties ? preferences.otherSpecialties.join(", ") : "",
            selectedStates: preferences.preferredStates || [],
            preferredHospitalType: preferences.hospitalPreference || "",
            preferredResidentCount: preferences.residentCountPreference || "",
            valuedCharacteristics: preferences.valuedCharacteristics || [],
          });
          
          // Also update UI state
          setSelectedStates(preferences.preferredStates || []);
          setSelectedOptions(preferences.valuedCharacteristics || []);
        }
      } catch (err) {
        console.error("Error fetching program preferences:", err);
        setError("Failed to load your program preferences. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);

  // Update form data whenever any input changes
  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      onlySearchingSpecialty: null,
      otherSpecialties: "",
      selectedStates: [],
      preferredHospitalType: "",
      preferredResidentCount: "",
      valuedCharacteristics: [],
    });
    setSelectedStates([]);
    setSelectedOptions([]);

    // Reset radio buttons and checkboxes by clearing their checked state
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.checked = false;
    });

    document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
  };

  const handleOptionChange = (option) => {
    let newSelectedOptions = [...selectedOptions];

    if (selectedOptions.includes(option)) {
      newSelectedOptions = selectedOptions.filter((item) => item !== option);
    } else {
      if (selectedOptions.length < 3) {
        newSelectedOptions = [...selectedOptions, option];
      }
    }

    setSelectedOptions(newSelectedOptions);
    updateFormData("valuedCharacteristics", newSelectedOptions);
  };

  const leftColumnOptions = [
    "Diversity of patient population",
    "Strong mentorship",
    "International electives",
    "Research opportunities",
    "Work-life balance",
    "Teaching excellence",
    "Procedural volume",
    "Community outreach",
    "High board pass rate",
  ];

  const rightColumnOptions = [
    "Flexible scheduling",
    "Subspecialty exposure",
    "Leadership training",
    "Resident wellness programs",
    "Plastic Surgery",
    "High board pass rate",
    "Otolaryngology (ENT)",
    "Cardiothoracic Surgery",
    "Neurosurgery",
  ];

  const toggleState = (state) => {
    const newSelectedStates = selectedStates.includes(state)
      ? selectedStates.filter((s) => s !== state)
      : [...selectedStates, state];

    setSelectedStates(newSelectedStates);
    updateFormData("selectedStates", newSelectedStates);
  };

  const handleSpecialtyChoice = (value) => {
    const fieldName = "onlySearchingSpecialty";
    updateFormData(fieldName, value === "yes");
  };

  const handleOtherSpecialties = (e) => {
    updateFormData("otherSpecialties", e.target.value);
  };

  const handleHospitalTypeChoice = (value) => {
    updateFormData("preferredHospitalType", value);
  };

  const handleResidentCountChoice = (value) => {
    updateFormData("preferredResidentCount", value);
  };

  const handleSubmit = async () => {
    try {
      // Show saving indicator
      setSaving(true);
      setError(null);
      
      // Map form data to backend format
      const programPreferenceData = {
        primarySpecialty: formData.onlySearchingSpecialty ? "Yes" : "No",
        otherSpecialties: formData.otherSpecialties.split(",").map(s => s.trim()).filter(s => s),
        preferredStates: formData.selectedStates,
        hospitalPreference: formData.preferredHospitalType,
        residentCountPreference: formData.preferredResidentCount,
        valuedCharacteristics: formData.valuedCharacteristics,
        isComplete: true
      };
      
      // Validate required fields
      if (!programPreferenceData.hospitalPreference) {
        setError("Please select your preferred hospital type");
        setSaving(false);
        return;
      }
      
      if (!programPreferenceData.residentCountPreference) {
        setError("Please select your preferred resident count");
        setSaving(false);
        return;
      }
      
      if (programPreferenceData.preferredStates.length === 0) {
        setError("Please select at least one preferred state");
        setSaving(false);
        return;
      }
      
      if (programPreferenceData.valuedCharacteristics.length === 0) {
        setError("Please select at least one valued characteristic");
        setSaving(false);
        return;
      }
      
      // Send data to backend
      const response = await programPreferences.save(programPreferenceData);
      
      if (response && response.success) {
        setSuccessMessage("Program preferences saved successfully!");
        setTimeout(() => {
          // Navigate back to dashboard after successful save
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error(response?.message || "Unknown error saving preferences");
      }
    } catch (err) {
      console.error("Error saving program preferences:", err);
      setError("Failed to save program preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Add error and success message display near submit button
  const renderMessages = () => (
    <>
      {error && (
        <div className="text-red-500 text-sm mt-2 mb-2 text-center">{error}</div>
      )}
      {successMessage && (
        <div className="text-green-500 text-sm mt-2 mb-2 text-center">{successMessage}</div>
      )}
    </>
  );

  // Update the desktop button to show loading state
  const renderDesktopButton = () => (
    <div className="hidden md:flex justify-center mt-8">
      {renderMessages()}
      <button
        className={`bg-[#197EAB] text-white py-2 px-6 rounded ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save & Continue'}
      </button>
    </div>
  );
  
  // Update the mobile button to show loading state
  const renderMobileButton = () => (
    <div className="md:hidden w-full flex justify-center mt-6 mb-4 flex-col items-center">
      {renderMessages()}
      <button
        className={`bg-[#197EAB] text-white py-2 px-6 rounded w-[180px] text-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save & Continue'}
      </button>
    </div>
  );

  return (
    <div className="px-[2rem]">
      <h1 className="text-[36px] font-semibold text-center pt-20 text-[#104962]">Finding Programs</h1>
      <div className="lg:w-[80%] xl:w-[924px] m-auto my-9">
        <p className="text-center text-[16px] text-[#104962]" style={{letterSpacing:'0.5px'}}>
          This section is meant to help applicants find programs that best fit
          what they're looking for. We recommend applying widely, but this page
          can help serve as a guide for programs that fit your preferences
          and/or for program signaling.
        </p>
      </div>

      <div className="bg-white p-6 w-full max-w-[928px] mx-auto font-sans flex items-center justify-center flex-col my-20 rounded-2xl shadow-xl">
        {/* Desktop view - original layout */}
        <div className="hidden md:flex items-start justify-center flex-col w-[70%] mb-8">
          <h2
            className="text-[16px] mb-4"
            style={{ fontWeight: 600, letterSpacing: "0.7px" }}
          >
            Are you only searching for programs in{" "}
            <span className="text-red-500">[Specialty chosen at signup]</span> ?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="specialty-no-desktop"
              name="specialty-search-desktop"
              value="no"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleSpecialtyChoice("no")}
            />
            <label htmlFor="specialty-no-desktop" className="ml-1">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="specialty-yes-desktop"
              name="specialty-search-desktop"
              value="yes"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleSpecialtyChoice("yes")}
            />
            <label htmlFor="specialty-yes-desktop" className="ml-1">
              Yes
            </label>
          </div>
        </div>

        {/* Mobile view - optimized for mobile based on image */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-4">
            Are you only searching for programs in{" "}
            <span className="text-red-500">[Specialty chosen at signup]</span> ?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="specialty-no-mobile"
              name="specialty-search-mobile"
              value="no"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleSpecialtyChoice("no")}
            />
            <label htmlFor="specialty-no-mobile" className="text-base">
              No
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="specialty-yes-mobile"
              name="specialty-search-mobile"
              value="yes"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleSpecialtyChoice("yes")}
            />
            <label htmlFor="specialty-yes-mobile" className="text-base">
              Yes
            </label>
          </div>
        </div>

        {/* Desktop view - original layout */}
        <div className="hidden md:flex items-start justify-center flex-col w-[70%] mb-8">
          <h2
            className="text-[16px] mb-4"
            style={{ fontWeight: 600, letterSpacing: "0.7px" }}
          >
            To which other specialties will you be applying?
          </h2>
          <input
            type="text"
            placeholder="Type Your Answer Here ..."
            className="w-[567px] h-[38px] border border-gray-300 rounded p-3 text-[14px] text-[#808080]"
            style={{ lineHeight: "24px", letterSpacing: "0.5px" }}
            onChange={handleOtherSpecialties}
            value={formData.otherSpecialties}
          />
        </div>

        {/* Mobile view - optimized for mobile based on image */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-4">
            To which other specialties will you be applying?
          </h2>
          <input
            type="text"
            placeholder="Type Your Answer Her ..."
            className="w-full h-[40px] border border-gray-300 rounded px-3 text-[14px] text-gray-500"
            onChange={handleOtherSpecialties}
            value={formData.otherSpecialties}
          />
        </div>

        {/* Desktop view - original layout */}
        <div className="hidden md:flex items-start justify-center flex-col w-[70%] mb-8">
          <h2
            className="text-[16px] mb-4"
            style={{ fontWeight: 600, letterSpacing: "0.7px" }}
          >
            Which state(s) are you most hoping to match in?
          </h2>
          <div className="relative">
            <button
              className="w-[271px] h-[35px] border border-gray-300 rounded p-3 text-left flex justify-between items-center"
              onClick={() => setShowStateDropdown(!showStateDropdown)}
            >
              <span
                className="text-[14px] text-[#808080] "
                style={{
                  fontWeight: 400,
                  lineHeight: "24px",
                  letterSpacing: "0.5px",
                }}
              >
                {selectedStates.length > 0
                  ? `${selectedStates.length} selected`
                  : "Select Your Answer"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showStateDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded">
                <div className="max-h-[200px] overflow-y-auto">
                  {states.map((state, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleState(state)}
                    >
                      <div
                        className={`w-5 h-5 border border-gray-400 ${
                          selectedStates.includes(state)
                            ? "bg-gray-100 flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {selectedStates.includes(state) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#197EAB]"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="ml-2">{state}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile view - optimized dropdown based on image */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-4">
            Which state(s) are you most hoping to match in?
          </h2>
          <div className="relative">
            <button
              className="w-full h-[40px] border border-gray-300 rounded px-3 py-2 text-left flex justify-between items-center"
              onClick={() => setShowStateDropdown(!showStateDropdown)}
            >
              <span className="text-[14px] text-gray-500">
                {selectedStates.length > 0
                  ? `${selectedStates.length} selected`
                  : "Select Your Answer"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showStateDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded max-h-[200px] overflow-y-auto">
                {states.map((state, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 border-b border-gray-200 cursor-pointer"
                    onClick={() => toggleState(state)}
                  >
                    <div
                      className={`w-5 h-5 border border-gray-300 ${
                        selectedStates.includes(state)
                          ? "bg-gray-100 flex items-center justify-center"
                          : ""
                      }`}
                    >
                      {selectedStates.includes(state) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-[#197EAB]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="ml-2">{state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop view - original layout */}
        <div className="hidden md:flex items-start justify-center flex-col w-[70%] mb-8">
          <h2
            className="text-[16px] mb-4"
            style={{ fontWeight: 600, letterSpacing: "0.7px" }}
          >
            Do you prefer large academic centers or smaller, community-level
            hospitals?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              name="hospital-preference-desktop"
              id="academic-desktop"
              value="academic"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleHospitalTypeChoice("academic")}
              checked={formData.preferredHospitalType === "academic"}
            />
            <label
              htmlFor="academic-desktop"
              className="ml-1 text-[15px]"
              style={{ fontWeight: 500 }}
            >
              Academic Centers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="hospital-preference-desktop"
              id="community-desktop"
              value="community"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleHospitalTypeChoice("community")}
              checked={formData.preferredHospitalType === "community"}
            />
            <label
              htmlFor="community-desktop"
              className="ml-1 text-[15px]"
              style={{ fontWeight: 500 }}
            >
              Community-Level Hospitals
            </label>
          </div>
        </div>

        {/* Mobile view - academic/community question */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-4">
            Do you prefer large academic centers or smaller, community-level
            hospitals?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="academic-mobile"
              name="hospital-type"
              value="academic"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleHospitalTypeChoice("academic")}
              checked={formData.preferredHospitalType === "academic"}
            />
            <label htmlFor="academic-mobile" className="text-base">
              Academic Centers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="community-mobile"
              name="hospital-type"
              value="community"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleHospitalTypeChoice("community")}
              checked={formData.preferredHospitalType === "community"}
            />
            <label htmlFor="community-mobile" className="text-base">
              Community-Level Hospitals
            </label>
          </div>
        </div>

        {/* Desktop view - original layout */}
        <div className="hidden md:flex items-start justify-center flex-col w-[70%] mb-8">
          <h2
            className="text-[16px] mb-4"
            style={{ fontWeight: 600, letterSpacing: "0.7px" }}
          >
            Do you prefer programs with many residents or programs with fewer
            residents?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              name="resident-count-desktop"
              id="many-desktop"
              value="many"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleResidentCountChoice("many")}
              checked={formData.preferredResidentCount === "many"}
            />
            <label
              htmlFor="many-desktop"
              className="ml-1 text-[15px]"
              style={{ fontWeight: 500 }}
            >
              Many
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="resident-count-desktop"
              id="fewer-desktop"
              value="fewer"
              className="w-5 h-5 border border-gray-400 mr-2 appearance-none rounded-full checked:border-blue-600 checked:border-4"
              onChange={() => handleResidentCountChoice("fewer")}
              checked={formData.preferredResidentCount === "fewer"}
            />
            <label
              htmlFor="fewer-desktop"
              className="ml-1 text-[15px]"
              style={{ fontWeight: 500 }}
            >
              Fewer
            </label>
          </div>
        </div>

        {/* Mobile view - residents count question */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-4">
            Do you prefer programs with many residents or programs with fewer
            residents?
          </h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="many-mobile"
              name="resident-count"
              value="many"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleResidentCountChoice("many")}
              checked={formData.preferredResidentCount === "many"}
            />
            <label htmlFor="many-mobile" className="text-base">
              Many
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="fewer-mobile"
              name="resident-count"
              value="fewer"
              className="w-4 h-4 border border-gray-300 mr-2"
              onChange={() => handleResidentCountChoice("fewer")}
              checked={formData.preferredResidentCount === "fewer"}
            />
            <label htmlFor="fewer-mobile" className="text-base">
              Fewer
            </label>
          </div>
        </div>

        {/* Desktop view - original layout */}
        <div className="hidden md:flex w-[70%] items-start justify-between flex-col">
          <h1
            className="text-[16px] mb-8"
            style={{
              fontWeight: 600,
              lineHeight: "24px",
              letterSpacing: "0.7px",
            }}
          >
            Choose <span className="text-[#197EAB]">three</span> characteristics
            that you value most in a residency program.
          </h1>

          <div className="flex gap-[7rem] w-full">
            <div className="w-full md:w-1/2 pr-4">
              {leftColumnOptions.map((option, index) => (
                <div
                  key={`left-desktop-${index}`}
                  className="flex items-center mb-6"
                >
                  <input
                    type="checkbox"
                    id={`left-desktop-option-${index}`}
                    className="h-3 w-3 border-gray-300"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionChange(option)}
                    disabled={
                      selectedOptions.length >= 3 &&
                      !selectedOptions.includes(option)
                    }
                  />
                  <label
                    htmlFor={`left-desktop-option-${index}`}
                    className="ml-3 text-[15px]"
                    style={{ fontWeight: 500 }}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="w-full md:w-1/2">
              {rightColumnOptions.map((option, index) => (
                <div
                  key={`right-desktop-${index}`}
                  className="flex items-center mb-6"
                >
                  <input
                    type="checkbox"
                    id={`right-desktop-option-${index}`}
                    className="h-3 w-3 border-gray-300"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionChange(option)}
                    disabled={
                      selectedOptions.length >= 3 &&
                      !selectedOptions.includes(option)
                    }
                  />
                  <label
                    htmlFor={`right-desktop-option-${index}`}
                    className="ml-3 text-[15px]"
                    style={{ fontWeight: 500 }}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile view - characteristics */}
        <div className="md:hidden w-full mb-6">
          <h2 className="text-[16px] font-semibold mb-1">
            Choose <span className="text-[#197EAB]">three</span> characteristics
            that you value most in a residency program.
          </h2>
          <p className="text-xs text-gray-500 mb-4">(Maximum Selection: 3)</p>

          <div className="flex flex-col">
            {[...leftColumnOptions, ...rightColumnOptions].map(
              (option, index) => (
                <div
                  key={`mobile-option-${index}`}
                  className="flex items-center mb-3"
                >
                  <input
                    type="checkbox"
                    id={`mobile-option-${index}`}
                    className="h-4 w-4 border border-gray-300"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionChange(option)}
                    disabled={
                      selectedOptions.length >= 3 &&
                      !selectedOptions.includes(option)
                    }
                  />
                  <label
                    htmlFor={`mobile-option-${index}`}
                    className="ml-2 text-base"
                  >
                    {option}
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        {/* Desktop view - original button */}
        {renderDesktopButton()}

        {/* Mobile view - button */}
        {renderMobileButton()}
      </div>
    </div>
  );
}
