import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from '../services/api';

export default function MatchMakerSignup() {
  // Current step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1 data
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    
    // Step 2 data
    country: "",
    state: "",
    city: "",
    zipCode: "",
    streetAddress: "",
    
    // Step 3 data
    nationality: "",
    workAuthorization: "",
    specialties: "",
    preferredLocations: "",
    
    // Step 4 data
    cv: null,
    image: null
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Clear error for this field when user types
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phone);
  };

  // Validate step 1 form
  const validateStep1 = () => {
    const newErrors = {};
    
    // Basic required field validation
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms";
    
    // Phone validation
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (e.g., +1 (123) 456-7890 or 123-456-7890)";
    }
    
    // Password match validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    
    // Return true if no errors (valid form)
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    // For first step, validate
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await auth.register(formData);
      if (res.success) {
        setShowSuccess(true);
        // Automatically redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMessage(res.message || "Registration failed. Please try again.");
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
      setShowError(true);
      console.error('Registration failed:', error);
    }
  };  

  // Handle file uploads
  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [fileType]: file });
  };

  return (
    <div className="min-h-screen p-4 font-inter px-[2rem] py-[4rem]">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl ">
        {/* Header */}
        <div className="w-full p-4 md:p-8 pb-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Create Your <span className="text-[#197EAB]">MatchMaker</span>{" "}
            Account
          </h1>
          <p
            className="text-[#808080] mt-2 mb-1"
            style={{ fontWeight: 400, lineHeight: "22px" }}
          >
            Let's get to know you better so we can match you with the right
            residency.
          </p>
          <p className="text-gray-600 mb-4">
            Already have an account?{" "}
            <a href="#" className="text-[#197EAB]">
              Sign in
            </a>
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-8 my-4" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your account has been created successfully.</span>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-8 my-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="px-8 pt-4">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-full h-1 ${
                  step <= currentStep ? "bg-[#197EAB]" : "bg-gray-200"
                } ${step < 4 ? "mr-1" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Forms side by side or stacked based on screen size */}
        <div className="flex flex-col md:flex-row justify-center m-auto py-4 md:py-8 w-full px-4">
          {/* Step 1 - General Info */}
          {currentStep === 1 && (
            <div className="w-full md:max-w-lg mx-auto">
              <p className="text-gray-500 mb-4">Step 1 of 4</p>
              <h2 className="text-black text-[16px] font-semibold mb-4">
                General info
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div className="relative w-full">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-gray-500`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  >
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (e.g., +1 (123) 456-7890)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full h-[40px] border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded p-3`}
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start mt-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className={`mt-1 mr-2 ${errors.termsAccepted ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="terms" className="text-gray-600 text-sm">
                    By creating an account you agree to the Terms of Service and
                    privacy policy.
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}

                <button 
                  className="w-full bg-[#197EAB] text-white p-3 rounded mt-4"
                  onClick={handleNext}
                >
                  Next
                </button>

                <p className="text-gray-600 mb-4 text-center">
                  Already have an account?{" "}
                  <a href="#" className="text-[#197EAB]">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Step 2 - Mailing Address */}
          {currentStep === 2 && (
            <div className="w-full md:max-w-lg mx-auto">
              <p className="text-gray-500 mb-4">Step 2 of 4</p>
              <h2 className="text-black text-[16px] font-semibold mb-4">Mailing Address</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full h-[40px] border border-gray-300 rounded p-3"
                  style={{
                    fontWeight: 400,
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#808080",
                  }}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full h-[40px] border border-gray-300 rounded p-3"
                  style={{
                    fontWeight: 400,
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#808080",
                  }}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full h-[40px] border border-gray-300 rounded p-3"
                  style={{
                    fontWeight: 400,
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#808080",
                  }}
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full h-[40px] border border-gray-300 rounded p-3"
                  style={{
                    fontWeight: 400,
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#808080",
                  }}
                />
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full h-[40px] border border-gray-300 rounded p-3"
                  style={{
                    fontWeight: 400,
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#808080",
                  }}
                />

                <div className="space-y-4 pt-4 mt-6">
                  <button 
                    className="w-full bg-[#197EAB] text-white p-3 rounded"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                  <button 
                    className="w-full bg-gray-200 text-gray-800 p-3 rounded transition"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Demographic Information */}
          {currentStep === 3 && (
            <div className="w-full md:max-w-lg mx-auto">
              <div className="mb-6">
                <p className="text-gray-500 mb-4">Step 3 of 4</p>
                <h2 className="text-black text-[16px] font-semibold mb-2">
                  Demographic Information
                </h2>
                <p className="text-[14px] text-[#808080]" style={{fontWeight:400}}>
                  Help us build a smarter match by telling us more about you
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="relative w-full">
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full h-10 border border-gray-300 rounded-md px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  >
                    <option value="" disabled>Nationality</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative w-full">
                  <select
                    name="workAuthorization"
                    value={formData.workAuthorization}
                    onChange={handleInputChange}
                    className="w-full h-10 border border-gray-300 rounded-md px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  >
                    <option value="" disabled>Are you authorized to work in the United States?</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative w-full">
                  <select
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    className="w-full h-10 border border-gray-300 rounded-md px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  >
                    <option value="" disabled>Specialty(ies) Applying To</option>
                    <option value="family">Family Medicine</option>
                    <option value="internal">Internal Medicine</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="surgery">General Surgery</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative w-full">
                  <select
                    name="preferredLocations"
                    value={formData.preferredLocations}
                    onChange={handleInputChange}
                    className="w-full h-10 border border-gray-300 rounded-md px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontWeight: 400,
                      fontSize: "12px",
                      letterSpacing: "0.5px",
                      color: "#808080",
                    }}
                  >
                    <option value="" disabled>Preferred Match Locations</option>
                    <option value="northeast">Northeast</option>
                    <option value="midwest">Midwest</option>
                    <option value="south">South</option>
                    <option value="west">West</option>
                    <option value="any">Any Location</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 items-start mt-6">
                <button 
                  className="w-full py-4 bg-[#197EAB] text-white rounded-md text-[16px] font-medium"
                  onClick={handleNext}
                >
                  Next
                </button>
                <button 
                  className="w-full py-4 bg-gray-100 text-black rounded-md text-[16px] font-medium"
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4 - File Upload */}
          {currentStep === 4 && (
            <div className="w-full md:max-w-lg mx-auto">
              <div className="mb-6">
                <p className="text-gray-500 mb-4">Step 4 of 4</p>
                <h2 className="text-black text-[16px] font-semibold mb-2">
                  Upload Documents (Optional)
                </h2>
                <p className="text-[14px] text-[#808080]" style={{fontWeight:400}}>
                  This helps us verify your educator status securely.
                </p>
              </div>

              <div className="mb-4">
                <div
                  className="border border-dashed border-gray-300 rounded-md p-4 md:p-8 flex flex-col items-center justify-center mb-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("cv-upload").click()}
                  style={{ minHeight: "150px" }}
                >
                  <input
                    type="file"
                    id="cv-upload"
                    name="cv"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, "cv")}
                  />
                  <div className="bg-gray-100 p-3 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-lg font-medium">
                    {formData.cv ? formData.cv.name : "Upload CV (optional)"}
                  </span>
                  <span className="text-gray-400 text-sm mt-2">
                    PDF, DOC or DOCX up to 5MB
                  </span>
                </div>

                <div
                  className="border border-dashed border-gray-300 rounded-md p-4 md:p-8 flex flex-col items-center justify-center mb-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("image-upload").click()}
                  style={{ minHeight: "150px" }}
                >
                  <input
                    type="file"
                    id="image-upload"
                    name="image"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                  <div className="bg-gray-100 p-3 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-lg font-medium">
                    {formData.image ? formData.image.name : "Upload Image (optional)"}
                  </span>
                  <span className="text-gray-400 text-sm mt-2">
                    JPG, PNG or GIF up to 2MB
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  className="w-full py-4 bg-[#197EAB] text-white rounded-md text-[16px] font-medium"
                  onClick={handleSubmit}
                >
                  Create Account
                </button>
                <button
                  className="w-full py-4 bg-gray-100 text-black rounded-md text-[16px] font-medium"
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}