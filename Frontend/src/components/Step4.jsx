import React from "react";
import PersonalStatement2 from "./PersonalStatement2";

const Step4 = () => {
  const handleSubmit = (value) => {
    console.log("Textarea Value:", value);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <PersonalStatement2
        step={4}
        totalSteps={9}
        progress={44}
        title="Tell us about a time during medical school when you demonstrated [Characteristic #1]."
        subtitle="(Don’t worry about perfect wording—we’ll help you polish it later)"
        textareaPlaceholder="Answer Here ..."
        buttonText="Next"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Step4;