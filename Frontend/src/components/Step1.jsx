import React from "react";
import PersonalStatement1 from "./PersonalStatement1";

const Step1 = () => {
  const inputFields = [
    "Internal Medicine",
    "Anesthesiology",
    "Pediatrics",
    "Pathology",
    "Surgery",
    "Urology",
    "Psychiatry",
    "Ophthalmology",
    "Family Medicine",
    "Plastic Surgery",
    "Emergency Medicine",
    "Physical Medicine and Rehabilitation (PM&R)",
    "Obstetrics and Gynecology (OB/GYN)",
    "Otolaryngology (ENT)",
    "Neurology",
    "Cardiothoracic Surgery",
    "CDermatology",
    "Neurosurgery",
    "Radiology",
    "Vascular Surgery",
    "Orthopedic Surgery",
    "Interventional Radiology",
    
  ];

  return (
    <div className="flex justify-center items-center mt-10">
      <PersonalStatement1
        step={1}
        totalSteps={9}
        progress={11}
        title="Which specialty will this personal statement be for?"
        instruction="(Can select multiple)"
        options={inputFields}
        buttonText="Next"
      />
    </div>
  );
};

export default Step1;
