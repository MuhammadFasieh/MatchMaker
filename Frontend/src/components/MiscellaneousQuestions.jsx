import { useState } from "react";

export default function MiscellaneousQuestions() {
  const [formData, setFormData] = useState({
    academicInterruptions: {
      hasInterruptions: null,
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

  const handleRadioChange = (value) => {
    setFormData({
      ...formData,
      academicInterruptions: {
        ...formData.academicInterruptions,
        hasInterruptions: value === "Yes",
      },
    });
  };

  const handleTextChange = (field, value) => {
    setFormData({
      ...formData,
      academicInterruptions: {
        ...formData.academicInterruptions,
        [field]: value,
      },
    });
  };

  const handleEducationInputChange = (type, index, field, value) => {
    const updatedEducation = [...formData.education[type]];
    if (!updatedEducation[index]) {
      updatedEducation[index] = { school: "", dates: "", field: "" };
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
          { school: "", dates: "", field: "" },
        ],
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

  const handleSubmit = () => {
    // This would typically send data to an API
    console.log("Form data submitted:", formData);
    alert("Data saved successfully");
  };

  const handleSaveAndContinue = () => {
    // Logic to save form data and proceed to next section
    console.log("Form data saved:", formData);
    alert("Data saved successfully");
  };

  // Initialize education arrays if they don't exist
  if (!formData.education.undergraduate) {
    formData.education.undergraduate = [];
  }
  if (!formData.education.graduate) {
    formData.education.graduate = [];
  }

  return (
    <div className="mx-[2rem]">
        <h1 className="pt-15 text-[36px] text-[#197EAB] text-center" style={{fontWeight:500}}>Miscellaneous Questions </h1>
      <div className="w-full max-w-[928px] mx-auto font-sans flex flex-col gap-8 mt-[3rem]">
        {/* Question 1 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 ">
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
                  name="interruptions"
                  className="mr-2 h-4 w-4 text-[#197EAB]"
                  checked={
                    formData.academicInterruptions.hasInterruptions === false
                  }
                  onChange={() => handleRadioChange("No")}
                />
                <span>No</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="interruptions"
                  className="mr-2 h-4 w-4 text-[#197EAB]"
                  checked={
                    formData.academicInterruptions.hasInterruptions === true
                  }
                  onChange={() => handleRadioChange("Yes")}
                />
                <span>Yes</span>
              </label>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 text-sm mb-2">
                Explain in your own words. Our AI assistant will help you polish
                it later.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows={4}
                placeholder="Type Your Answer Here..."
                value={formData.academicInterruptions.explanation}
                onChange={(e) =>
                  handleTextChange("explanation", e.target.value)
                }
              ></textarea>
            </div>
          </div>
        </div>

        {/* Question 2 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 ">
          <div className="text-gray-500 text-sm mb-1">Question 2 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-4">
            Previous Education
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Undergraduate Degrees
            </h3>

            {/* Desktop: 3-column grid, Mobile: Stacked layout */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-700 mb-1">School/University</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "school",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  Dates of Attendance
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "dates",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Field of Study</p>
                <select
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "field",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Your Answer</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Mobile layout (stacked) */}
            <div className="md:hidden space-y-4 mb-3">
              <div>
                <p className="text-sm text-gray-700 mb-1">School/University</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "school",
                      e.target.value
                    )
                  }
                />
              </div>

              <button
                className="bg-[#197EAB] text-white px-3 py-1 rounded text-sm flex items-center"
                onClick={() => addEducationEntry("undergraduate")}
              >
                <span className="mr-1">+</span> Add
              </button>

              <div>
                <p className="text-sm text-gray-700 mb-1">
                  Dates of Attendance
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "dates",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-1">Field of Study</p>
                <select
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                  onChange={(e) =>
                    handleEducationInputChange(
                      "undergraduate",
                      0,
                      "field",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Your Answer</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Physics">Physics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* For desktop, this shows additional undergraduate entries */}
            <div className="hidden md:block">
              {formData.education.undergraduate.map(
                (degree, index) =>
                  index > 0 && (
                    <div
                      key={`ug-${index}`}
                      className="grid grid-cols-3 gap-4 mb-3"
                    >
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.school}
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
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.dates}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "undergraduate",
                              index,
                              "dates",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <select
                          className="w-full border border-gray-300 rounded p-2 bg-white"
                          value={degree.field}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "undergraduate",
                              index,
                              "field",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Your Answer</option>
                          <option value="Biology">Biology</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Physics">Physics</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )
              )}

              <button
                className="bg-[#197EAB] text-white px-3 py-1 rounded text-sm flex items-center mt-2"
                onClick={() => addEducationEntry("undergraduate")}
              >
                <span className="mr-1">+</span> Add
              </button>
            </div>

            {/* For mobile, this shows additional undergraduate entries */}
            <div className="md:hidden mt-4">
              {formData.education.undergraduate.map(
                (degree, index) =>
                  index > 0 && (
                    <div
                      key={`ug-mobile-${index}`}
                      className="space-y-4 mb-4 pt-4 border-t border-gray-200"
                    >
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          School/University
                        </p>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.school}
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
                        <p className="text-sm text-gray-700 mb-1">
                          Dates of Attendance
                        </p>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.dates}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "undergraduate",
                              index,
                              "dates",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          Field of Study
                        </p>
                        <select
                          className="w-full border border-gray-300 rounded p-2 bg-white"
                          value={degree.field}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "undergraduate",
                              index,
                              "field",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Your Answer</option>
                          <option value="Biology">Biology</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Physics">Physics</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Graduate Degrees
            </h3>

            {/* Desktop: 3-column grid */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-700 mb-1">School/University</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "school",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  Dates of Attendance
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "dates",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Field of Study</p>
                <select
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "field",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Your Answer</option>
                  <option value="MBA">MBA</option>
                  <option value="MS">MS</option>
                  <option value="PhD">PhD</option>
                  <option value="MPH">MPH</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Mobile layout (stacked) */}
            <div className="md:hidden space-y-4 mb-3">
              <div>
                <p className="text-sm text-gray-700 mb-1">School/University</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "school",
                      e.target.value
                    )
                  }
                />
              </div>

              <button
                className="bg-[#197EAB] text-white px-3 py-1 rounded text-sm flex items-center"
                onClick={() => addEducationEntry("graduate")}
              >
                <span className="mr-1">+</span> Add
              </button>

              <div>
                <p className="text-sm text-gray-700 mb-1">
                  Dates of Attendance
                </p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "dates",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-1">Field of Study</p>
                <select
                  className="w-full border border-gray-300 rounded p-2 bg-white"
                  onChange={(e) =>
                    handleEducationInputChange(
                      "graduate",
                      0,
                      "field",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select Your Answer</option>
                  <option value="MBA">MBA</option>
                  <option value="MS">MS</option>
                  <option value="PhD">PhD</option>
                  <option value="MPH">MPH</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* For desktop, this shows additional graduate entries */}
            <div className="hidden md:block">
              {formData.education.graduate.map(
                (degree, index) =>
                  index > 0 && (
                    <div
                      key={`grad-${index}`}
                      className="grid grid-cols-3 gap-4 mb-3"
                    >
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.school}
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
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.dates}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "graduate",
                              index,
                              "dates",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <select
                          className="w-full border border-gray-300 rounded p-2 bg-white"
                          value={degree.field}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "graduate",
                              index,
                              "field",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Your Answer</option>
                          <option value="MBA">MBA</option>
                          <option value="MS">MS</option>
                          <option value="PhD">PhD</option>
                          <option value="MPH">MPH</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )
              )}

              <button
                className="bg-[#197EAB] text-white px-3 py-1 rounded text-sm flex items-center mt-2"
                onClick={() => addEducationEntry("graduate")}
              >
                <span className="mr-1">+</span> Add
              </button>
            </div>

            {/* For mobile, this shows additional graduate entries */}
            <div className="md:hidden mt-4">
              {formData.education.graduate.map(
                (degree, index) =>
                  index > 0 && (
                    <div
                      key={`grad-mobile-${index}`}
                      className="space-y-4 mb-4 pt-4 border-t border-gray-200"
                    >
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          School/University
                        </p>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.school}
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
                        <p className="text-sm text-gray-700 mb-1">
                          Dates of Attendance
                        </p>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={degree.dates}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "graduate",
                              index,
                              "dates",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          Field of Study
                        </p>
                        <select
                          className="w-full border border-gray-300 rounded p-2 bg-white"
                          value={degree.field}
                          onChange={(e) =>
                            handleEducationInputChange(
                              "graduate",
                              index,
                              "field",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Your Answer</option>
                          <option value="MBA">MBA</option>
                          <option value="MS">MS</option>
                          <option value="PhD">PhD</option>
                          <option value="MPH">MPH</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>

        {/* Question 3 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 ">
          <div className="text-gray-500 text-sm mb-1">Question 3 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-4">
            Honors or Awards
          </h2>

          <div className="mb-4">
            <div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Title</p>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2"
                    placeholder="Type Your Answer Here..."
                    onChange={(e) =>
                      handleHonorChange(0, "title", e.target.value)
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">Date</p>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded p-2"
                    onChange={(e) =>
                      handleHonorChange(0, "date", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">Description</p>
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  rows={3}
                  placeholder="Type Your Answer Here..."
                  onChange={(e) =>
                    handleHonorChange(0, "description", e.target.value)
                  }
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {characterCounts.honorsDescription} / 300
                </div>
              </div>
            </div>

            {formData.honorsAwards.map(
              (honor, index) =>
                index > 0 && (
                  <div key={`honor-${index}`} className="mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Type Your Answer Here..."
                          value={honor.title}
                          onChange={(e) =>
                            handleHonorChange(index, "title", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded p-2"
                          value={honor.date}
                          onChange={(e) =>
                            handleHonorChange(index, "date", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <textarea
                        className="w-full border border-gray-300 rounded p-2"
                        rows={3}
                        placeholder="Type Your Answer Here..."
                        value={honor.description}
                        onChange={(e) =>
                          handleHonorChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      ></textarea>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {honor.description ? honor.description.length : 0} / 300
                      </div>
                    </div>
                  </div>
                )
            )}

            <button
              className="bg-[#197EAB] text-white px-3 py-1 rounded text-sm flex items-center mt-2"
              onClick={addHonorEntry}
            >
              <span className="mr-1">+</span> Add
            </button>
          </div>
        </div>

        {/* Question 4 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 ">
          <div className="text-gray-500 text-sm mb-1">Question 4 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-4">
            Impactful Experience
          </h2>

          <div className="mb-4">
            <p className="text-gray-800 mb-3">
              Describe one experience that significantly shaped who you are
              today.
            </p>
            <div className="relative">
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows={5}
                placeholder="You can write freely. Our AI assistant will help you summarize or rephrase later."
                value={formData.impactfulExperience}
                onChange={(e) => handleExperienceChange(e.target.value)}
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {characterCounts.impactfulExperience} / 500
              </div>
            </div>
          </div>
        </div>

        {/* Question 5 */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 ">
          <div className="text-gray-500 text-sm mb-1">Question 5 of 5</div>
          <h2 className="text-xl font-medium text-[#197EAB] mb-4">
            Hobbies and Interests
          </h2>

          <div className="mb-4">
            <p className="text-gray-800 mb-3">
              Please share your hobbies and interests.
            </p>
            <div className="relative">
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows={4}
                placeholder="e.g. Hiking, Photography, Digital Art, Reading historical fiction"
                value={formData.hobbiesInterests}
                onChange={(e) => handleHobbiesChange(e.target.value)}
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {characterCounts.hobbiesInterests} / 300
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="bg-[#197EAB] text-white px-5 py-2 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            className="bg-[#197EAB] text-white px-5 py-2 rounded"
            onClick={handleSaveAndContinue}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
