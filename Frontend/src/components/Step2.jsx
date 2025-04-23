import React from "react";
import PersonalStatement2 from "./PersonalStatement2";

const Step2 = () => {
  const handleSubmit = (value) => {
    console.log("Textarea Value:", value);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <PersonalStatement2
        step={2}
        totalSteps={9}
        progress={22}
        title="What made you decide to apply to this specialty?"
        textareaPlaceholder="Answer Here ..."
        buttonText="Next"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Step2;