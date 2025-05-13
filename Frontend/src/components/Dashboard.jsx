import React, { useState, useEffect } from "react";
import dashborad from "../images/dashboard.svg";
import { useAuth } from "../context/AuthContext";
import { auth, dashboard } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplicationReady, setIsApplicationReady] = useState(false);
  const [isSectionUpdating, setIsSectionUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [progressData, setProgressData] = useState({
    completedSections: 0,
    totalSections: 5,
    percentage: 0,
    dashboardUser: null,
    sectionStatus: {
      personalStatement: {
        status: "Not Started",
        icon: "arrow",
        color: "amber",
      },
      research: { status: "Not Started", icon: "arrow", color: "amber" },
      experiences: { status: "Not Started", icon: "arrow", color: "amber" },
    },
  });

  // Fetch both user and dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data
      const dashResponse = await dashboard.getDashboardData();
      console.log("Raw dashboard response:", dashResponse);

      if (dashResponse && dashResponse.success && dashResponse.dashboard) {
        const { progress, sections, user } = dashResponse.dashboard;
        console.log(
          "Dashboard data fetched successfully:",
          dashResponse.dashboard
        );
        console.log("User data from dashboard API:", user);

        // CRITICAL FIX: Logging Personal Statement status specifically
        console.log("PERSONAL STATEMENT STATUS:", sections.personalStatement);

        // Set user data directly from the dashboard API
        if (user) {
          // Important: Set the userData state with the user object from dashboard
          setUserData(user);
          console.log("Set userData state with:", user);
        }

        // Map backend data to frontend format
        setProgressData({
          completedSections: progress.completedSections || 0,
          totalSections: progress.totalSections || 5,
          percentage: progress.percentageComplete || 0,
          dashboardUser: user, // Also set the dashboardUser property
          sectionStatus: {
            personalStatement: {
              status: sections.personalStatement.status,
              icon: getIconForStatus(sections.personalStatement.status),
              color: getColorForStatus(sections.personalStatement.status),
            },
            research: {
              status: sections.researchProducts.status,
              icon: getIconForStatus(sections.researchProducts.status),
              color: getColorForStatus(sections.researchProducts.status),
            },
            experiences: {
              status: sections.experiences.status,
              icon: getIconForStatus(sections.experiences.status),
              color: getColorForStatus(sections.experiences.status),
            },
          },
        });

        // If we don't have user data yet, try to fetch from profile
        if (!user) {
          try {
            // Fetch user profile as a fallback
            const userResponse = await auth.getProfile();
            if (userResponse && userResponse.success) {
              setUserData(userResponse.user);
              console.log(
                "User data fetched from profile API:",
                userResponse.user
              );
            }
          } catch (profileErr) {
            console.warn("Could not fetch user profile:", profileErr);
          }
        }

        // Check if application is ready
        try {
          const readinessResponse = await dashboard.checkApplicationReadiness();
          if (readinessResponse && readinessResponse.success) {
            setIsApplicationReady(readinessResponse.isReady);
          }
        } catch (readinessErr) {
          console.error("Error checking application readiness:", readinessErr);
          // Continue even if readiness check fails
        }
      } else {
        // If API fails, use fallback data
        setError(
          "Failed to load dashboard data: " +
            (dashResponse?.message || "Unknown error")
        );

        // Use fallback data if no response
        setProgressData({
          completedSections: 0,
          totalSections: 5,
          percentage: 0,
          sectionStatus: {
            personalStatement: {
              status: "Not Started",
              icon: getIconForStatus("Not Started"),
              color: getColorForStatus("Not Started"),
            },
            research: {
              status: "Not Started",
              icon: getIconForStatus("Not Started"),
              color: getColorForStatus("Not Started"),
            },
            experiences: {
              status: "Not Started",
              icon: getIconForStatus("Not Started"),
              color: getColorForStatus("Not Started"),
            },
          },
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");

      // Fallback data
      setProgressData({
        completedSections: 0,
        totalSections: 5,
        percentage: 0,
        sectionStatus: {
          personalStatement: {
            status: "Not Started",
            icon: getIconForStatus("Not Started"),
            color: getColorForStatus("Not Started"),
          },
          research: {
            status: "Not Started",
            icon: getIconForStatus("Not Started"),
            color: getColorForStatus("Not Started"),
          },
          experiences: {
            status: "Not Started",
            icon: getIconForStatus("Not Started"),
            color: getColorForStatus("Not Started"),
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Special function to force personal statement completion if needed
  const forceCheckPersonalStatementStatus = async () => {
    try {
      console.log("Performing special personal statement status check");

      // Check if we think it's already completed in the UI
      const currentStatus = progressData.sectionStatus.personalStatement.status;
      console.log("Current personal statement UI status:", currentStatus);

      if (currentStatus !== "Completed") {
        console.log(
          "Personal statement not showing as completed, checking backend status..."
        );

        // Get the latest status from the backend
        const dashboardData = await dashboard.getDashboardData();

        if (dashboardData?.dashboard?.sections?.personalStatement?.isComplete) {
          console.log(
            "Backend shows personal statement as complete, updating UI..."
          );

          // Update the local state to match the backend
          setProgressData((prevData) => ({
            ...prevData,
            sectionStatus: {
              ...prevData.sectionStatus,
              personalStatement: {
                status: "Completed",
                icon: "check",
                color: "green",
              },
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error checking personal statement status:", error);
    }
  };
  const forceCheckResearchStatus = async () => {
    try {
      console.log("Performing special research product status check");

      // Check if we think it's already completed in the UI
      const currentStatus = progressData.sectionStatus.research.status;
      console.log("Current research product UI status:", currentStatus);

      if (currentStatus !== "Completed") {
        console.log(
          "Research products not showing as completed, checking backend status..."
        );

        // Get the latest status from the backend
        const dashboardData = await dashboard.getDashboardData();

        if (dashboardData?.dashboard?.sections?.researchProducts?.isComplete) {
          console.log(
            "Backend shows research products as complete, updating UI..."
          );

          // Update the local state to match the backend
          setProgressData((prevData) => ({
            ...prevData,
            sectionStatus: {
              ...prevData.sectionStatus,
              research: {
                status: "Completed",
                icon: "check",
                color: "green",
              },
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error checking research product status:", error);
    }
  };

  // Initial data load and also refresh when user returns to this page
  useEffect(() => {
    // Fetch dashboard data when the component mounts or when the user navigates back to it
    fetchDashboardData().then(() => {
      // Also force check the personal statement status after data loads
      forceCheckPersonalStatementStatus();
      forceCheckResearchStatus();
    });

    // Set up a listener for when the user returns to this page via browser navigation
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Dashboard: Page is visible again, refreshing data");
        fetchDashboardData().then(() => {
          // Also force check the personal statement status after data loads
          forceCheckPersonalStatementStatus();
          forceCheckResearchStatus();
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Update profile data (for demo/testing)
  const updateProfile = async (newData) => {
    try {
      setLoading(true);
      const response = await auth.updateProfile(newData);
      if (response && response.success) {
        setUserData(response.user);

        // Refresh dashboard data with new user info
        fetchDashboardData();

        setUpdateMessage({
          type: "success",
          text: "Profile updated successfully",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateMessage({
        type: "error",
        text: `Failed to update profile: ${err.message}`,
      });
    } finally {
      setLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

  // Function to update section status
  const updateSectionStatus = async (sectionName, isComplete) => {
    try {
      setIsSectionUpdating(true);

      // Get API section name based on frontend section name
      const apiSectionName = mapSectionNameToApi(sectionName);

      // Call API to update section status
      const response = await dashboard.updateSectionProgress(
        apiSectionName,
        isComplete
      );

      if (response && response.success && response.dashboard) {
        const { progress, sections, user } = response.dashboard;

        // Update local state with new data
        setProgressData({
          completedSections: progress.completedSections,
          totalSections: progress.totalSections,
          percentage: progress.percentageComplete,
          dashboardUser: user || progressData.dashboardUser,
          sectionStatus: {
            personalStatement: {
              status: sections.personalStatement.status,
              icon: getIconForStatus(sections.personalStatement.status),
              color: getColorForStatus(sections.personalStatement.status),
            },
            research: {
              status: sections.researchProducts.status,
              icon: getIconForStatus(sections.researchProducts.status),
              color: getColorForStatus(sections.researchProducts.status),
            },
            experiences: {
              status: sections.experiences.status,
              icon: getIconForStatus(sections.experiences.status),
              color: getColorForStatus(sections.experiences.status),
            },
          },
        });

        // Check if application is ready after update
        const readinessResponse = await dashboard.checkApplicationReadiness();
        if (readinessResponse && readinessResponse.success) {
          setIsApplicationReady(readinessResponse.isReady);
        }

        // Show success message
        setUpdateMessage({
          type: "success",
          text: `${sectionName} status updated successfully`,
        });
      } else {
        throw new Error("Failed to update section status");
      }
    } catch (err) {
      console.error(`Error updating ${sectionName} status:`, err);
      setUpdateMessage({
        type: "error",
        text: `Failed to update ${sectionName} status: ${err.message}`,
      });
    } finally {
      setIsSectionUpdating(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

  // Helper to map frontend section names to API section names
  const mapSectionNameToApi = (sectionName) => {
    const mapping = {
      "Personal Statement": "personalStatement",
      "Research Products": "researchProducts",
      Experiences: "experiences",
    };

    return mapping[sectionName] || sectionName.toLowerCase();
  };

  // Helper function to get icon based on status
  const getIconForStatus = (status) => {
    switch (status) {
      case "Completed":
        return "check";
      case "In Progress":
        return "plus";
      case "Not Started":
      default:
        return "arrow";
    }
  };

  // Helper function to get color based on status
  const getColorForStatus = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In Progress":
        return "blue";
      case "Not Started":
      default:
        return "amber";
    }
  };

  // Toggle section completion status
  const toggleSectionCompletion = (sectionName) => {
    const section = progressData.sectionStatus[sectionToKey(sectionName)];
    const isCurrentlyComplete = section.status === "Completed";

    // Only allow marking as complete/incomplete if not already updating
    if (!isSectionUpdating) {
      updateSectionStatus(sectionName, !isCurrentlyComplete);
    }
  };

  // Helper to convert section display name to object key
  const sectionToKey = (sectionName) => {
    const mapping = {
      "Personal Statement": "personalStatement",
      "Research Products": "research",
      Experiences: "experiences",
    };

    return mapping[sectionName] || sectionName.toLowerCase();
  };

  // Function to safely display user data with fallbacks
  const displayUserData = (field, fallback = "") => {
    console.log(`Displaying ${field}:`, {
      progressData: progressData?.dashboardUser?.[field],
      userData: userData?.[field],
      currentUser: currentUser?.[field],
    });

    // Special case for name field
    if (field === "name") {
      // Try from dashboard user data first (from API response)
      if (progressData?.dashboardUser?.name) {
        return progressData.dashboardUser.name;
      }

      // Then try from fetched userData
      if (userData?.name) {
        return userData.name;
      }

      // Then try from currentUser context
      if (currentUser?.name) {
        return currentUser.name;
      }

      // If no name found, return the fallback
      return fallback || "Dr.";
    }

    // Try from dashboard user data first (from API response)
    if (progressData && progressData.dashboardUser) {
      if (
        progressData.dashboardUser[field] !== undefined &&
        progressData.dashboardUser[field] !== null
      ) {
        return progressData.dashboardUser[field];
      }
    }

    // Then try from fetched userData
    if (userData && userData[field] !== undefined && userData[field] !== null) {
      return userData[field];
    }

    // Then try from currentUser context
    if (
      currentUser &&
      currentUser[field] !== undefined &&
      currentUser[field] !== null
    ) {
      return currentUser[field];
    }

    // Only use fallback if explicitly provided
    return fallback;
  };

  // For debug: Show all available user data
  const showAllUserData = () => {
    console.log("Dashboard User:", progressData?.dashboardUser);
    console.log("User Data:", userData);
    console.log("Current User:", currentUser);

    // Show raw values for first and last name specifically
    console.log("First Name Values:", {
      progressData: progressData?.dashboardUser?.firstName,
      userData: userData?.firstName,
      currentUser: currentUser?.firstName,
    });

    console.log("Last Name Values:", {
      progressData: progressData?.dashboardUser?.lastName,
      userData: userData?.lastName,
      currentUser: currentUser?.lastName,
    });

    setUpdateMessage({
      type: "info",
      text: "User data logged to console.",
    });

    setTimeout(() => {
      setUpdateMessage(null);
    }, 3000);
  };

  // For quick testing of profile data
  const handleUpdateProfileClick = () => {
    const randomNumber = Math.floor(Math.random() * 1000);
    updateProfile({
      firstName: `Fasih${randomNumber}`,
      lastName: `Doe${randomNumber}`,
      email: `fasih${randomNumber}@gmail.com`,
      phoneNumber: `+1 (555) ${randomNumber}-4567`,
      specialty: ["Cardiology", "Neurology", "Pediatrics", "Oncology"][
        Math.floor(Math.random() * 4)
      ],
      university: "Johns Hopkins University School of Medicine",
      graduationYear: "2023",
    });
  };

  // For quick setting of profile data
  const setDefaultProfileClick = () => {
    updateProfile({
      firstName: "Fasih",
      lastName: "Doe",
      email: "fasih@gmail.com",
      phoneNumber: "+1 (555) 123-4567",
      specialty: "Neurology",
      university: "Johns Hopkins University School of Medicine",
      graduationYear: "2023",
    });
  };

  // Function to check if a field actually has data
  const hasUserData = (field) => {
    // Special case for name field
    if (field === "name") {
      return !!(
        progressData?.dashboardUser?.name ||
        userData?.name ||
        currentUser?.name
      );
    }

    return (
      (progressData &&
        progressData.dashboardUser &&
        progressData.dashboardUser[field] !== undefined &&
        progressData.dashboardUser[field] !== null &&
        progressData.dashboardUser[field] !== "") ||
      (userData &&
        userData[field] !== undefined &&
        userData[field] !== null &&
        userData[field] !== "") ||
      (currentUser &&
        currentUser[field] !== undefined &&
        currentUser[field] !== null &&
        currentUser[field] !== "")
    );
  };

  // Handle sections that don't exist in the database yet
  const getSectionButton = (sectionName, path) => {
    const sectionKey = sectionToKey(sectionName);
    const section = progressData.sectionStatus[sectionKey];

    // Special handling for Personal Statement - only show Start or Completed
    if (sectionName === "Personal Statement") {
      if (section.status === "Completed") {
        return (
          <div className="flex space-x-2">
            <Link
              to={path}
              className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={() => toggleSectionCompletion(sectionName)}
              disabled={isSectionUpdating}
              className="border border-red-300 rounded px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Mark Incomplete
            </button>
          </div>
        );
      } else {
        // For Personal Statement, treat "In Progress" as "Not Started"
        return (
          <div className="flex space-x-2">
            <Link
              to={path}
              className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50"
            >
              Start
            </Link>
          </div>
        );
      }
    }

    // Normal handling for other sections
    if (section.status === "Completed") {
      return (
        <div className="flex space-x-2">
          <Link
            to={path}
            className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => toggleSectionCompletion(sectionName)}
            disabled={isSectionUpdating}
            className="border border-red-300 rounded px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Mark Incomplete
          </button>
        </div>
      );
    } else if (section.status === "In Progress") {
      return (
        <div className="flex space-x-2">
          <Link
            to={path}
            className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50"
          >
            Continue
          </Link>
        </div>
      );
    } else {
      return (
        <div className="flex space-x-2">
          <Link
            to={path}
            className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:bg-gray-50"
          >
            Start
          </Link>
        </div>
      );
    }
  };

  // Clear all local storage data
  const clearAllData = () => {
    try {
      localStorage.clear();

      setUpdateMessage({
        type: "info",
        text: "All local data cleared. Refreshing...",
      });

      // Refresh page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error clearing data:", err);
      setUpdateMessage({
        type: "error",
        text: `Failed to clear data: ${err.message}`,
      });
    }
  };

  // Rendering logic
  if (loading) {
    return (
      <div className="min-h-screen py-4 px-4 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4 flex flex-col items-center justify-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-4xl">
          <p>{error}</p>
        </div>
      )}

      {updateMessage && (
        <div
          className={`
          ${
            updateMessage.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : updateMessage.type === "info"
              ? "bg-blue-100 border-blue-400 text-blue-700"
              : "bg-red-100 border-red-400 text-red-700"
          } 
          px-4 py-3 rounded mb-4 w-full max-w-4xl
        `}
        >
          <p>{updateMessage.text}</p>
        </div>
      )}

      {isApplicationReady && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-full max-w-4xl flex justify-between items-center">
          <p>Your application is ready for program recommendations!</p>
          <Link
            to="/programs"
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            View Programs
          </Link>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl mb-4 p-6 w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <div className="rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-6">
            <img
              src={displayUserData("profileImage", dashborad)}
              alt={`${displayUserData("name")}`}
              className="h-44 w-44 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-medium text-[#2d6a8e]">
              {displayUserData("name", "Dr.")}
            </h1>

            {hasUserData("email") && (
              <p className="text-gray-700">
                <span className="font-medium">Email:</span>{" "}
                {displayUserData("email")}
              </p>
            )}

            {hasUserData("phoneNumber") && (
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span>{" "}
                {displayUserData("phoneNumber")}
              </p>
            )}

            {hasUserData("specialty") && (
              <p className="text-gray-700">
                <span className="font-medium">Specialty:</span>{" "}
                {displayUserData("specialty")}
              </p>
            )}

            {(hasUserData("university") || hasUserData("medicalSchool")) && (
              <p className="text-gray-700">
                <span className="font-medium">Institution:</span>{" "}
                {displayUserData("medicalSchool") ||
                  displayUserData("university")}
              </p>
            )}

            {hasUserData("graduationYear") && (
              <p className="text-gray-700">
                <span className="font-medium">Graduation Year:</span>{" "}
                {displayUserData("graduationYear")}
              </p>
            )}

            {/* Debug buttons panel - remove in production */}
            {/* <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={handleUpdateProfileClick}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Test: Update Profile
              </button>
              <button 
                onClick={setDefaultProfileClick}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Set Default Profile
              </button>
              <button 
                onClick={showAllUserData}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Debug: Log User Data
              </button>
              <button 
                onClick={clearAllData}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Clear All Data
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Applicant Progress */}
      <div className="bg-white rounded-2xl shadow-xl mb-4 p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-medium text-[#2d6a8e] mb-4">
          Applicant Progress
        </h2>
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-500">
            {progressData.completedSections} / {progressData.totalSections}{" "}
            Sections
          </p>
          <p className="text-2xl font-medium text-[#2d6a8e]">
            {progressData.percentage}%
          </p>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#6b97c3] rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressData.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Section Progress */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-medium text-[#2d6a8e] mb-4">
          Section Progress
        </h2>

        {/* Personal Statement */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-200">
          <p className="font-medium text-gray-800 mb-2 md:mb-0">
            Personal Statement
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <p className="text-gray-500 mr-4">
              {progressData.sectionStatus.personalStatement.status ===
              "Completed"
                ? "Completed"
                : "Not Started"}
            </p>
            <div
              className={`bg-${
                progressData.sectionStatus.personalStatement.status ===
                "Completed"
                  ? "green"
                  : "amber"
              }-500 rounded-full p-1.5 mr-4 transition-all duration-300`}
            >
              {progressData.sectionStatus.personalStatement.status ===
              "Completed" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {getSectionButton("Personal Statement", "/personal-statement")}
          </div>
        </div>

        {/* Research Products */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-200">
          <p className="font-medium text-gray-800 mb-2 md:mb-0">
            Research Products
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <p className="text-gray-500 mr-4">
              {progressData.sectionStatus.research.status}
            </p>
            <div
              className={`bg-${progressData.sectionStatus.research.color}-500 rounded-full p-1.5 mr-4 transition-all duration-300`}
            >
              {progressData.sectionStatus.research.icon === "plus" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {progressData.sectionStatus.research.icon === "check" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
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
              {progressData.sectionStatus.research.icon === "arrow" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {getSectionButton("Research Products", "/research")}
          </div>
        </div>

        {/* Experiences */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4">
          <p className="font-medium text-gray-800 mb-2 md:mb-0">Experiences</p>
          <div className="flex items-center mt-2 md:mt-0">
            <p className="text-gray-500 mr-4">
              {progressData.sectionStatus.experiences.status}
            </p>
            <div
              className={`bg-${progressData.sectionStatus.experiences.color}-500 rounded-full p-1.5 mr-4 transition-all duration-300`}
            >
              {progressData.sectionStatus.experiences.icon === "plus" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {progressData.sectionStatus.experiences.icon === "check" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
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
              {progressData.sectionStatus.experiences.icon === "arrow" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {getSectionButton("Experiences", "/experiences")}
          </div>
        </div>
      </div>
    </div>
  );
}
