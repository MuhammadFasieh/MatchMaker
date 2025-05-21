import { useState, useEffect } from "react";
import { miscQuestions } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MiscellaneousQuestions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    professionalism: {
      hasIssues: null,
      explanation: "",
    },
    education: {
      undergraduate: [],
      graduate: [],
    },
    honorsAwards: [],
    impactfulExperience: "",
    hobbiesInterests: "",
  });

  const [characterCounts, setCharacterCounts] = useState({
    honorsDescription: 0,
    impactfulExperience: 0,
    hobbiesInterests: 0,
  });

  // Fetch existing miscellaneous data on component mount
  useEffect(() => {
    const fetchMiscData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await miscQuestions.getAll();
        
        if (response.success && response.miscData) {
          // Transform backend data to match frontend structure if needed
          const miscData = response.miscData;
          
          // Map backend data to our form structure
          setFormData({
            professionalism: miscData.professionalism || {
              hasIssues: null,
              explanation: "",
            },
            education: {
              undergraduate: miscData.education?.undergraduate?.map(edu => ({
                school: edu.school || "",
                startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : "",
                endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : "",
                fieldOfStudy: edu.fieldOfStudy || "",
              })) || [],
              graduate: miscData.education?.graduate?.map(edu => ({
                school: edu.school || "",
                startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : "",
                endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : "",
                fieldOfStudy: edu.fieldOfStudy || "",
              })) || [],
            },
            honorsAwards: miscData.honorsAwards?.map(honor => ({
              title: honor.title || "",
              date: honor.date ? new Date(honor.date).toISOString().split('T')[0] : "",
              description: honor.description || "",
            })) || [],
            impactfulExperience: miscData.impactfulExperience || "",
            hobbiesInterests: miscData.hobbiesInterests || "",
          });

          // Update character counts
          if (miscData.honorsAwards && miscData.honorsAwards.length > 0) {
            const lastHonor = miscData.honorsAwards[miscData.honorsAwards.length - 1];
            setCharacterCounts(prev => ({
              ...prev,
              honorsDescription: lastHonor.description?.length || 0
            }));
          }
          
          if (miscData.impactfulExperience) {
            setCharacterCounts(prev => ({
              ...prev,
              impactfulExperience: miscData.impactfulExperience.length
            }));
          }
          
          if (miscData.hobbiesInterests) {
            setCharacterCounts(prev => ({
              ...prev,
              hobbiesInterests: miscData.hobbiesInterests.length
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching miscellaneous data:", error);
        setError("Failed to load your data. Please refresh the page and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMiscData();
  }, []);

  const handleProfessionalismRadioChange = (value) => {
    setFormData({
      ...formData,
      professionalism: {
        ...formData.professionalism,
        hasIssues: value === "Yes",
      },
    });
  };

  const handleProfessionalismTextChange = (value) => {
    setFormData({
      ...formData,
      professionalism: {
        ...formData.professionalism,
        explanation: value,
      },
    });
  };

  const handleEducationInputChange = (type, index, field, value) => {
    const updatedEducation = [...formData.education[type]];
    if (!updatedEducation[index]) {
      updatedEducation[index] = { school: "", startDate: "", endDate: "", fieldOfStudy: "" };
    }
    updatedEducation[index][field] = value;

    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [type]: updatedEducation,
      },
    });
  };

  const addEducationEntry = (type) => {
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [type]: [
          ...formData.education[type],
          { school: "", startDate: "", endDate: "", fieldOfStudy: "" },
        ],
      },
    });
  };

  const removeEducationEntry = (type, index) => {
    const updatedEducation = [...formData.education[type]];
    updatedEducation.splice(index, 1);
    
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [type]: updatedEducation,
      },
    });
  };

  const handleHonorChange = (index, field, value) => {
    const updatedHonors = [...formData.honorsAwards];
    if (!updatedHonors[index]) {
      updatedHonors[index] = { title: "", date: "", description: "" };
    }
    updatedHonors[index][field] = value;

    if (field === "description") {
      setCharacterCounts({
        ...characterCounts,
        honorsDescription: value.length,
      });
    }

    setFormData({
      ...formData,
      honorsAwards: updatedHonors,
    });
  };

  const addHonorEntry = () => {
    setFormData({
      ...formData,
      honorsAwards: [
        ...formData.honorsAwards,
        { title: "", date: "", description: "" },
      ],
    });
  };

  const removeHonorEntry = (index) => {
    const updatedHonors = [...formData.honorsAwards];
    updatedHonors.splice(index, 1);
    
    setFormData({
      ...formData,
      honorsAwards: updatedHonors,
    });
  };

  const handleExperienceChange = (value) => {
    setFormData({
      ...formData,
      impactfulExperience: value,
    });
    setCharacterCounts({
      ...characterCounts,
      impactfulExperience: value.length,
    });
  };

  const handleHobbiesChange = (value) => {
    setFormData({
      ...formData,
      hobbiesInterests: value,
    });
    setCharacterCounts({
      ...characterCounts,
      hobbiesInterests: value.length,
    });
  };

  // Convert frontend data format to backend format
  const prepareDataForSubmission = () => {
    // Transform education data to match backend schema
    const transformedUndergraduate = formData.education.undergraduate.map(edu => ({
      school: edu.school,
      startDate: edu.startDate,
      endDate: edu.endDate,
      fieldOfStudy: edu.fieldOfStudy,
    })).filter(edu => edu.school && edu.startDate && edu.endDate && edu.fieldOfStudy);

    const transformedGraduate = formData.education.graduate.map(edu => ({
      school: edu.school,
      startDate: edu.startDate,
      endDate: edu.endDate,
      fieldOfStudy: edu.fieldOfStudy,
    })).filter(edu => edu.school && edu.startDate && edu.endDate && edu.fieldOfStudy);

    // Transform honors/awards to match backend schema
    const transformedHonors = formData.honorsAwards.map(honor => ({
      title: honor.title,
      date: honor.date,
      description: honor.description,
    })).filter(honor => honor.title && honor.date && honor.description);

    return {
      professionalism: formData.professionalism,
      education: {
        undergraduate: transformedUndergraduate,
        graduate: transformedGraduate,
      },
      honorsAwards: transformedHonors,
      impactfulExperience: formData.impactfulExperience,
      hobbiesInterests: formData.hobbiesInterests,
    };
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const dataToSubmit = prepareDataForSubmission();
      
      // Save data to backend
      const response = await miscQuestions.save(dataToSubmit);
      
      if (response.success) {
        // Navigate to dashboard after successful save
        navigate("/dashboard");
      } else {
        setError("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving miscellaneous data:", error);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const dataToSubmit = prepareDataForSubmission();
      
      // Save data to backend
      const response = await miscQuestions.save(dataToSubmit);
      
      if (response.success) {
        // Show success message but stay on page
        alert("Data saved successfully!");
      } else {
        setError("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving miscellaneous data:", error);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mx-[2rem]">
      <h1 className="pt-15 text-[36px] text-[#197EAB] text-center" style={{fontWeight:500}}>Miscellaneous Questions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-[928px] mx-auto" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="w-full max-w-[928px] mx-auto font-sans flex flex-col gap-8 mt-[3rem]">
        {/* Question 1 - Professionalism Issues */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="text-gray-500 text-sm mb-1">Question 1 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-3">
            Academic/Professional Interruptions
          </h2>

          <div className="mb-4">
            <p className="text-gray-800 mb-1">
              Have you had any unplanned professionalism or academic issues in
              your medical education or training that caused an interruption or
              extension?
            </p>
            <p className="text-gray-500 text-sm italic mb-4">
              (Note: This section is not intended to solicit information about
              your health, disability, or family status.)
            </p>

            <div className="mb-3">
              <label className="flex items-center mb-2">
                <input
                  type="radio"
                  name="professionalismIssues"
                  className="mr-2 h-4 w-4 text-[#197EAB]"
                  checked={formData.professionalism.hasIssues === false}
                  onChange={() => handleProfessionalismRadioChange("No")}
                />
                <span>No</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="professionalismIssues"
                  className="mr-2 h-4 w-4 text-[#197EAB]"
                  checked={formData.professionalism.hasIssues === true}
                  onChange={() => handleProfessionalismRadioChange("Yes")}
                />
                <span>Yes</span>
              </label>
            </div>

            {formData.professionalism.hasIssues === true && (
              <div className="mt-4">
                <p className="text-gray-700 text-sm mb-2">
                  Explain in your own words. Our AI assistant will help you polish
                  it later.
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Please provide details about any academic or professional interruptions..."
                  value={formData.professionalism.explanation}
                  onChange={(e) => handleProfessionalismTextChange(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Question 2 - Education */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="text-gray-500 text-sm mb-1">Question 2 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-3">
            Education Background
          </h2>

          {/* Undergraduate Education */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Undergraduate Education
            </h3>

            {formData.education.undergraduate.map((edu, index) => (
              <div key={`ug-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Entry {index + 1}</h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeEducationEntry("undergraduate", index)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      School
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Institution name"
                      value={edu.school}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "undergraduate",
                          index,
                          "school",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Major/Field of study"
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "undergraduate",
                          index,
                          "fieldOfStudy",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={edu.startDate}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "undergraduate",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={edu.endDate}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "undergraduate",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="mt-2 bg-[#197EAB] text-white py-2 px-4 rounded-lg hover:bg-[#1A6B94] transition duration-300"
              onClick={() => addEducationEntry("undergraduate")}
            >
              + Add Undergraduate Education
            </button>
          </div>

          {/* Graduate Education */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Graduate Education
            </h3>

            {formData.education.graduate.map((edu, index) => (
              <div key={`grad-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Entry {index + 1}</h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeEducationEntry("graduate", index)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      School
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Institution name"
                      value={edu.school}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "graduate",
                          index,
                          "school",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Major/Field of study"
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "graduate",
                          index,
                          "fieldOfStudy",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={edu.startDate}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "graduate",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={edu.endDate}
                      onChange={(e) =>
                        handleEducationInputChange(
                          "graduate",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="mt-2 bg-[#197EAB] text-white py-2 px-4 rounded-lg hover:bg-[#1A6B94] transition duration-300"
              onClick={() => addEducationEntry("graduate")}
            >
              + Add Graduate Education
            </button>
          </div>
        </div>

        {/* Question 3 - Honors and Awards */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="text-gray-500 text-sm mb-1">Question 3 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-3">
            Honors and Awards
          </h2>

          {formData.honorsAwards.map((honor, index) => (
            <div key={`honor-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Honor/Award {index + 1}</h4>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeHonorEntry(index)}
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Award or honor title"
                    value={honor.title}
                    onChange={(e) => handleHonorChange(index, "title", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={honor.date}
                    onChange={(e) => handleHonorChange(index, "date", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this honor or award"
                  rows="3"
                  value={honor.description}
                  onChange={(e) => handleHonorChange(index, "description", e.target.value)}
                ></textarea>
                <p className="text-gray-500 text-right text-sm mt-1">
                  {honor.description.length} / 500 characters
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="mt-2 bg-[#197EAB] text-white py-2 px-4 rounded-lg hover:bg-[#1A6B94] transition duration-300"
            onClick={addHonorEntry}
          >
            + Add Honor or Award
          </button>
        </div>

        {/* Question 4 - Impactful Experience */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="text-gray-500 text-sm mb-1">Question 4 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-3">
            Most Impactful Experience
          </h2>

          <p className="text-gray-700 mb-3">
            Describe an experience that has significantly influenced your decision to pursue a career in medicine.
          </p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
            placeholder="Share your most impactful experience..."
            value={formData.impactfulExperience}
            onChange={(e) => handleExperienceChange(e.target.value)}
          ></textarea>
          <p className="text-gray-500 text-right text-sm mt-1">
            {characterCounts.impactfulExperience} / 2000 characters
          </p>
        </div>

        {/* Question 5 - Hobbies and Interests */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="text-gray-500 text-sm mb-1">Question 5 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-3">
            Hobbies and Interests
          </h2>

          <p className="text-gray-700 mb-3">
            Share your hobbies, interests, and activities outside of medicine that contribute to your well-being and personal growth.
          </p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Describe your hobbies and interests..."
            value={formData.hobbiesInterests}
            onChange={(e) => handleHobbiesChange(e.target.value)}
          ></textarea>
          <p className="text-gray-500 text-right text-sm mt-1">
            {characterCounts.hobbiesInterests} / 1000 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-10">
          <button
            type="button"
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-300 disabled:cursor-not-allowed"
              onClick={handleSaveAndContinue}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save and Continue Editing"}
            </button>

            <button
              type="button"
              className="bg-[#197EAB] text-white py-2 px-6 rounded-lg hover:bg-[#1A6B94] transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save and Return to Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
