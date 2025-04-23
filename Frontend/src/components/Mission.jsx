import React from "react";

const Mission = () => {
  return (
    <div className="w-full bg-white flex items-center justify-center">
    <div className="mission py-[11vw] px-[7vw] w-[1200px]">
      <h1 className="text-[48px] text-[#1E1E1E]" style={{ fontWeight: 700 }}>
        Our Mission
      </h1>
      <p className="text-[20px] text-[#757575] tracking-wide" style={{lineHeight:"120%", fontWeight:400}}>
        We believe matching should be about people, not metrics. At Match Maker,
        we’re redefining the residency application process by focusing on fit
        over formulas. Our AI-driven platform helps students craft authentic
        applications, connect with expert advisors, and seamlessly build their
        portfolios. We want to ensure that every applicant finds the right
        program based on their unique strengths and aspirations.
      </p>
    </div>
    </div>
  );
};

export default Mission;
