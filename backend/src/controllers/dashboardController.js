const User = require('../models/User');
const PersonalStatement = require('../models/PersonalStatement');
const ResearchProduct = require('../models/ResearchProduct');
const Experience = require('../models/Experience');
const MiscellaneousQuestion = require('../models/MiscellaneousQuestion');
const ProgramPreference = require('../models/ProgramPreference');

// Get application progress data for dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
      dashboard: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          medicalSchool: user.demographics.medicalSchool,
          profileImage: user.profileImage
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
    const userId = req.userId;

    // Get user progress
    const user = await User.findById(userId).select('applicationProgress');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if application is at least 85% complete
    const isReady = user.applicationProgress.percentageComplete >= 85;

    return res.status(200).json({
      success: true,
      isReady,
      percentageComplete: user.applicationProgress.percentageComplete
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