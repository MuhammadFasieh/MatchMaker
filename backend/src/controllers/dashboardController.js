const User = require('../models/User');
const PersonalStatement = require('../models/PersonalStatement');
const ResearchProduct = require('../models/ResearchProduct');
const Experience = require('../models/Experience');
const MiscellaneousQuestion = require('../models/MiscellaneousQuestion');
const ProgramPreference = require('../models/ProgramPreference');

// Get application progress data for dashboard
exports.getDashboardData = async (req, res) => {
  try {
    // Debug log to see what's in the request
    console.log("Dashboard request headers:", req.headers);
    console.log("Dashboard request user:", req.user);
    
    // Check if user ID exists in request
    if (!req.user || !req.user.id) {
      console.error("No user ID found in request");
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }

    const userId = req.user.id;
    console.log("Looking up user with ID:", userId);

    // Get user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.error(`User with ID ${userId} not found in database`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`User found: ${user.name || 'Unknown'}`);

    // Initialize user fields if they don't exist
    if (!user.name) {
      console.log("User has missing name field, setting default value");
      user.name = "Dr.";
      await user.save();
    }

    // Initialize applicationProgress if it doesn't exist
    if (!user.applicationProgress) {
      console.log("User has no applicationProgress, initializing");
      user.applicationProgress = {
        totalSections: 5,
        completedSections: 0,
        percentageComplete: 0
      };
      await user.save();
    }

    // Get application sections
    const personalStatement = await PersonalStatement.findOne({ userId }).select('isComplete');
    const researchProducts = await ResearchProduct.find({ userId }).select('_id isComplete');
    const experiences = await Experience.find({ userId }).select('_id isComplete isMostMeaningful');
    const miscellaneous = await MiscellaneousQuestion.findOne({ userId }).select('isComplete');
    const programPreference = await ProgramPreference.findOne({ userId }).select('isComplete');

    // Debug section data
    console.log("Sections found:", {
      personalStatement: personalStatement ? true : false,
      researchProducts: researchProducts.length,
      experiences: experiences.length,
      miscellaneous: miscellaneous ? true : false,
      programPreference: programPreference ? true : false
    });

    // Calculate section completion
    const sectionsStatus = {
      personalStatement: {
        isComplete: personalStatement ? personalStatement.isComplete : false,
        status: personalStatement ? (personalStatement.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      },
      researchProducts: {
        isComplete: researchProducts.length > 0 && researchProducts.every(product => product.isComplete),
        count: researchProducts.length,
        status: researchProducts.length > 0 
          ? (researchProducts.every(product => product.isComplete) ? 'Completed' : 'In Progress') 
          : 'Not Started'
      },
      experiences: {
        isComplete: experiences.length > 0 && experiences.every(exp => exp.isComplete),
        count: experiences.length,
        mostMeaningfulCount: experiences.filter(exp => exp.isMostMeaningful).length,
        status: experiences.length > 0 
          ? (experiences.every(exp => exp.isComplete) ? 'Completed' : 'In Progress') 
          : 'Not Started'
      },
      miscellaneous: {
        isComplete: miscellaneous ? miscellaneous.isComplete : false,
        status: miscellaneous ? (miscellaneous.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      },
      programPreference: {
        isComplete: programPreference ? programPreference.isComplete : false,
        status: programPreference ? (programPreference.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      }
    };

    // Calculate completed sections
    const totalSections = 5; // Personal Statement, Research, Experiences, Misc, Program Prefs
    let completedSections = 0;

    if (sectionsStatus.personalStatement.isComplete) completedSections++;
    if (sectionsStatus.researchProducts.isComplete) completedSections++;
    if (sectionsStatus.experiences.isComplete) completedSections++;
    if (sectionsStatus.miscellaneous.isComplete) completedSections++;
    if (sectionsStatus.programPreference.isComplete) completedSections++;

    // Calculate percentage
    const percentageComplete = Math.round((completedSections / totalSections) * 100);

    // Update user's progress
    user.applicationProgress = {
      totalSections,
      completedSections,
      percentageComplete
    };
    await user.save();
    
    console.log("Dashboard data retrieved successfully");

    return res.status(200).json({
      success: true,
      dashboard: {
        user: {
          name: user.name || "Dr.",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          medicalSchool: user.demographics?.medicalSchool || "",
          profileImage: user.profileImage || "",
          specialty: user.specialty || "",
          university: user.university || "",
          graduationYear: user.graduationYear || ""
        },
        progress: {
          totalSections,
          completedSections,
          percentageComplete
        },
        sections: sectionsStatus
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard data',
      error: error.message
    });
  }
};

// Check if the application is ready for program recommendations
exports.checkApplicationReadiness = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user progress
    const user = await User.findById(userId).select('applicationProgress');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize applicationProgress if it doesn't exist
    if (!user.applicationProgress) {
      // Set default values for applicationProgress
      user.applicationProgress = {
        totalSections: 5,
        completedSections: 0,
        percentageComplete: 0
      };
      
      // Save the updated user
      await user.save();
    }

    // Check if application is at least 85% complete
    const percentageComplete = user.applicationProgress.percentageComplete || 0;
    const isReady = percentageComplete >= 85;

    return res.status(200).json({
      success: true,
      isReady,
      percentageComplete
    });
  } catch (error) {
    console.error('Application readiness check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking application readiness',
      error: error.message
    });
  }
};

// Update section progress
exports.updateSectionProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sectionName } = req.params;
    const { isComplete } = req.body;

    if (isComplete === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isComplete status is required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update the appropriate section based on sectionName
    let updatedModel = null;
    switch (sectionName) {
      case 'personalStatement':
        updatedModel = await PersonalStatement.findOneAndUpdate(
          { userId },
          { isComplete },
          { new: true, upsert: true }
        );
        break;

      case 'researchProducts':
        // For research products, we'll update all products for this user
        const research = await ResearchProduct.updateMany(
          { userId },
          { isComplete }
        );
        updatedModel = research;
        break;

      case 'experiences':
        // For experiences, we'll update all experiences for this user
        const experiences = await Experience.updateMany(
          { userId },
          { isComplete }
        );
        updatedModel = experiences;
        break;

      case 'miscellaneous':
        updatedModel = await MiscellaneousQuestion.findOneAndUpdate(
          { userId },
          { isComplete },
          { new: true, upsert: true }
        );
        break;

      case 'programPreference':
        updatedModel = await ProgramPreference.findOneAndUpdate(
          { userId },
          { isComplete },
          { new: true, upsert: true }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid section name'
        });
    }

    // Recalculate dashboard data after update
    // Get application sections
    const personalStatement = await PersonalStatement.findOne({ userId }).select('isComplete');
    const researchProducts = await ResearchProduct.find({ userId }).select('_id isComplete');
    const experiences = await Experience.find({ userId }).select('_id isComplete isMostMeaningful');
    const miscellaneous = await MiscellaneousQuestion.findOne({ userId }).select('isComplete');
    const programPreference = await ProgramPreference.findOne({ userId }).select('isComplete');

    // Calculate section completion
    const sectionsStatus = {
      personalStatement: {
        isComplete: personalStatement ? personalStatement.isComplete : false,
        status: personalStatement ? (personalStatement.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      },
      researchProducts: {
        isComplete: researchProducts.length > 0 && researchProducts.every(product => product.isComplete),
        count: researchProducts.length,
        status: researchProducts.length > 0 
          ? (researchProducts.every(product => product.isComplete) ? 'Completed' : 'In Progress') 
          : 'Not Started'
      },
      experiences: {
        isComplete: experiences.length > 0 && experiences.every(exp => exp.isComplete),
        count: experiences.length,
        mostMeaningfulCount: experiences.filter(exp => exp.isMostMeaningful).length,
        status: experiences.length > 0 
          ? (experiences.every(exp => exp.isComplete) ? 'Completed' : 'In Progress') 
          : 'Not Started'
      },
      miscellaneous: {
        isComplete: miscellaneous ? miscellaneous.isComplete : false,
        status: miscellaneous ? (miscellaneous.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      },
      programPreference: {
        isComplete: programPreference ? programPreference.isComplete : false,
        status: programPreference ? (programPreference.isComplete ? 'Completed' : 'In Progress') : 'Not Started'
      }
    };

    // Calculate completed sections
    const totalSections = 5; // Personal Statement, Research, Experiences, Misc, Program Prefs
    let completedSections = 0;

    if (sectionsStatus.personalStatement.isComplete) completedSections++;
    if (sectionsStatus.researchProducts.isComplete) completedSections++;
    if (sectionsStatus.experiences.isComplete) completedSections++;
    if (sectionsStatus.miscellaneous.isComplete) completedSections++;
    if (sectionsStatus.programPreference.isComplete) completedSections++;

    // Calculate percentage
    const percentageComplete = Math.round((completedSections / totalSections) * 100);

    // Update user's progress
    user.applicationProgress = {
      totalSections,
      completedSections,
      percentageComplete
    };
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${sectionName} section updated successfully`,
      dashboard: {
        user: {
          name: user.name || "Dr.",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          medicalSchool: user.demographics?.medicalSchool || "",
          profileImage: user.profileImage || "",
          specialty: user.specialty || "",
          university: user.university || "",
          graduationYear: user.graduationYear || ""
        },
        progress: {
          totalSections,
          completedSections,
          percentageComplete
        },
        sections: sectionsStatus
      }
    });
  } catch (error) {
    console.error('Update section progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating section progress',
      error: error.message
    });
  }
}; 