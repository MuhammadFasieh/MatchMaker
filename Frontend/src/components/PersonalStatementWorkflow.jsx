import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openai, personalStatement, dashboard } from "../services/api";
import Specialties from "./PersonalStatementComponents/Specialties";
import SpecialtyReason from "./PersonalStatementComponents/SpecialtyReason";
import CharacteristicsSelect from "./PersonalStatementComponents/CharacteristicsSelect";
import CharacteristicExperience from "./PersonalStatementComponents/CharacteristicExperience";
import ThesisSelection from "./PersonalStatementComponents/ThesisSelection";
import PersonalStatementPreview from "./PersonalStatementComponents/PersonalStatementPreview";
import PersonalStatementSuccess from "./PersonalStatementComponents/PersonalStatementSuccess";

// Main workflow component
const PersonalStatementWorkflow = () => {
  const navigate = useNavigate();
  const totalSteps = 9;
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    specialties: [],
    reason: "",
    characteristics: [],
    experiences: ["", "", ""],
    thesisStatements: [],
    selectedThesis: "",
    personalStatement: ""
  });
  
  const [loadingThesis, setLoadingThesis] = useState(false);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [savingData, setSavingData] = useState(false);
  
  // Load existing data if available
  useEffect(() => {
    const fetchExistingStatement = async () => {
      try {
        const response = await personalStatement.get();
        if (response.success && response.data) {
          setFormData({
            specialties: response.data.specialties || [],
            reason: response.data.reason || "",
            characteristics: response.data.characteristics || [],
            experiences: response.data.experiences || ["", "", ""],
            thesisStatements: response.data.thesisStatements || [],
            selectedThesis: response.data.selectedThesis || "",
            personalStatement: response.data.personalStatement || ""
          });
          
          // If we have data but it's not yet complete, ensure it's marked as Not Started instead of In Progress
          try {
            // Check if status is "In Progress" but not "Completed"
            const dashboardData = await dashboard.getDashboardData();
            if (dashboardData?.dashboard?.sections?.personalStatement?.status === 'In Progress') {
              // Reset status to Not Started
              await dashboard.updateSectionProgress('personalStatement', false);
            }
          } catch (error) {
            console.error("Error resetting personal statement status:", error);
          }
        }
      } catch (error) {
        console.error("Error loading existing personal statement:", error);
        // This is normal for new users, don't show an alert
      }
    };
    
    fetchExistingStatement();
  }, []);
  
  // Calculate progress percentage
  const calculateProgress = (step) => {
    return Math.round((step / totalSteps) * 100);
  };
  
  // Step handlers
  const handleSpecialtiesSubmit = (specialties) => {
    setFormData({
      ...formData,
      specialties
    });
    setCurrentStep(2);
  };
  
  const handleReasonSubmit = (reason) => {
    setFormData({
      ...formData,
      reason
    });
    setCurrentStep(3);
  };
  
  const handleCharacteristicsSubmit = (characteristics) => {
    setFormData({
      ...formData,
      characteristics
    });
    setCurrentStep(4);
  };
  
  const handleExperience1Submit = (experience) => {
    const newExperiences = [...formData.experiences];
    newExperiences[0] = experience;
    
    setFormData({
      ...formData,
      experiences: newExperiences
    });
    setCurrentStep(5);
  };
  
  const handleExperience2Submit = (experience) => {
    const newExperiences = [...formData.experiences];
    newExperiences[1] = experience;
    
    setFormData({
      ...formData,
      experiences: newExperiences
    });
    setCurrentStep(6);
  };
  
  const handleExperience3Submit = (experience) => {
    const newExperiences = [...formData.experiences];
    newExperiences[2] = experience;
    
    setFormData({
      ...formData,
      experiences: newExperiences
    });
    
    // Generate thesis statements after all experiences are submitted
    generateThesisStatements(
      formData.specialties, 
      formData.reason, 
      formData.characteristics, 
      [...newExperiences]
    );
  };
  
  const handleThesisSelect = (thesis) => {
    setFormData({
      ...formData,
      selectedThesis: thesis
    });
    
    // Generate personal statement
    generatePersonalStatement(
      formData.specialties,
      formData.reason,
      formData.characteristics,
      formData.experiences,
      thesis
    );
  };
  
  // Handle edits to the personal statement
  const handleEditPersonalStatement = (editedStatement) => {
    setFormData({
      ...formData,
      personalStatement: editedStatement
    });
  };
  
  // Update the handleFinish function to accept edited statement
  const handleFinish = async (editedStatement) => {
    // If an edited statement is provided, update the formData
    if (editedStatement && editedStatement !== formData.personalStatement) {
      setFormData({
        ...formData,
        personalStatement: editedStatement
      });
    }
    
    // Save to database
    setSavingData(true);
    
    try {
      const dataToSave = {
        ...formData,
        personalStatement: editedStatement || formData.personalStatement
      };
      
      const response = await personalStatement.save(dataToSave);
      
      if (response.success) {
        // Automatically mark the section as complete
        try {
          await dashboard.updateSectionProgress('personalStatement', true);
          console.log("Personal statement automatically marked as complete");
        } catch (dashboardError) {
          console.error("Error updating dashboard:", dashboardError);
          // Continue execution, don't return
        }
        
        // Move to success screen instead of navigating to dashboard
        setCurrentStep(9);
      } else {
        alert("Failed to save your personal statement. Please try again.");
      }
    } catch (error) {
      console.error("Error saving personal statement:", error);
      alert("An error occurred while saving your personal statement.");
    } finally {
      setSavingData(false);
    }
  };
  
  // Add a function to handle final submission from success screen
  const handleFinalSubmit = () => {
    // Add a small delay to ensure the API call completes
    setTimeout(() => {
      // Navigate back to the dashboard which will refresh the data
      navigate("/dashboard");
    }, 500);
  };
  
  // OpenAI API calls
  const generateThesisStatements = async (
    specialties, 
    reason, 
    characteristics, 
    experiences
  ) => {
    setLoadingThesis(true);
    
    try {
      const response = await openai.generateThesisStatements({
        specialties,
        reason,
        characteristics,
        experiences
      });
      
      if (response.success && response.data) {
        setFormData({
          ...formData,
          thesisStatements: response.data,
          experiences
        });
        setCurrentStep(7);
      } else {
        alert("Failed to generate thesis statements. Please try again.");
      }
    } catch (error) {
      console.error("Error generating thesis statements:", error);
      alert("An error occurred while generating thesis statements.");
    } finally {
      setLoadingThesis(false);
    }
  };
  
  const generatePersonalStatement = async (
    specialties,
    reason,
    characteristics,
    experiences,
    selectedThesis
  ) => {
    setLoadingStatement(true);
    
    try {
      const response = await openai.generatePersonalStatement({
        specialties,
        reason,
        characteristics,
        experiences,
        selectedThesis
      });
      
      if (response.success && response.data) {
        setFormData({
          ...formData,
          personalStatement: response.data,
          selectedThesis
        });
        setCurrentStep(8);
      } else {
        alert("Failed to generate personal statement. Please try again.");
      }
    } catch (error) {
      console.error("Error generating personal statement:", error);
      alert("An error occurred while generating your personal statement.");
    } finally {
      setLoadingStatement(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Specialties 
            step={1}
            totalSteps={totalSteps}
            progress={calculateProgress(1)}
            onNext={handleSpecialtiesSubmit}
          />
        );
        
      case 2:
        return (
          <SpecialtyReason 
            step={2}
            totalSteps={totalSteps}
            progress={calculateProgress(2)}
            selectedSpecialties={formData.specialties}
            onNext={handleReasonSubmit}
            onBack={handleBack}
          />
        );
        
      case 3:
        return (
          <CharacteristicsSelect 
            step={3}
            totalSteps={totalSteps}
            progress={calculateProgress(3)}
            onNext={handleCharacteristicsSubmit}
            onBack={handleBack}
          />
        );
        
      case 4:
        return (
          <CharacteristicExperience 
            step={4}
            totalSteps={totalSteps}
            progress={calculateProgress(4)}
            characteristicNumber={1}
            characteristic={formData.characteristics[0]}
            onNext={handleExperience1Submit}
            onBack={handleBack}
          />
        );
        
      case 5:
        return (
          <CharacteristicExperience 
            step={5}
            totalSteps={totalSteps}
            progress={calculateProgress(5)}
            characteristicNumber={2}
            characteristic={formData.characteristics[1]}
            onNext={handleExperience2Submit}
            onBack={handleBack}
          />
        );
        
      case 6:
        return (
          <CharacteristicExperience 
            step={6}
            totalSteps={totalSteps}
            progress={calculateProgress(6)}
            characteristicNumber={3}
            characteristic={formData.characteristics[2]}
            onNext={handleExperience3Submit}
            onBack={handleBack}
          />
        );
        
      case 7:
        return (
          <ThesisSelection 
            step={7}
            totalSteps={totalSteps}
            progress={calculateProgress(7)}
            thesisStatements={formData.thesisStatements}
            isLoading={loadingThesis}
            onNext={handleThesisSelect}
            onBack={handleBack}
          />
        );
        
      case 8:
        return (
          <PersonalStatementPreview 
            step={8}
            totalSteps={totalSteps}
            progress={calculateProgress(8)}
            personalStatement={formData.personalStatement}
            isLoading={loadingStatement || savingData}
            onBack={handleBack}
            onFinish={handleFinish}
            onEdit={handleEditPersonalStatement}
          />
        );
        
      case 9:
        return (
          <PersonalStatementSuccess 
            step={9}
            totalSteps={totalSteps}
            progress={100}
            onBack={() => setCurrentStep(8)}
            onFinish={handleFinalSubmit}
          />
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="py-10 md:py-16">
      {renderStep()}
    </div>
  );
};

export default PersonalStatementWorkflow; 