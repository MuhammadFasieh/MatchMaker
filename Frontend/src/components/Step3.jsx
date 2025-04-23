import React from "react";
import PersonalStatement1 from "./PersonalStatement1";

const Step3 = () => {
  // Define 10 input fields
  const inputFields = [
    "Compassionate",
    "Strong",
    "Resilient",
    "communicator",
    "Collaborative",
    "Quick decision-",
    "Detail-oriented",
    "maker",
    "Hardworking",
    "Patient-centered",
    "Adaptable",
    "Research-driven",
    "Empathetic",
    "Culturally aware",
  ];

  return (
    <div className="flex justify-center items-center">
      <PersonalStatement1
        step={3}
        totalSteps={10}
        progress={33}
        title="Choose 3 characteristics that best represent you and that you would like to highlight in your personal statement"
        instruction="(must pick 3)"
        options={inputFields}
        buttonText="Next"
      />
    </div>
  );
};

export default Step3;
