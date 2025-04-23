import React from "react";
import aboutimg from "../images/aboutimg.jpeg";

const About = () => {
  return (
    <div className="about h-[600px] w-full flex items-center justify-center md:bg-white">
      <div className="div1 h-full w-[90%] px-[8vw] flex items-start justify-center flex-col">
        <div className="content">
          <h1 className="text-[48px] text-[#1E1E1E]" style={{fontWeight:700}}>About Us</h1>
          <p className="text-[16px] text-[#757575]" style={{fontWeight:400,lineHeight:'140%',}}>
            At Match Maker, we believe that residency applications should be
            about more than just numbers—they should reflect who you are as a
            future physician. Our platform empowers medical students with
            AI-driven tools and expert guidance to craft compelling applications
            that showcase their unique strengths. From personal statement
            assistance to research portfolio development and one-click
            application population, we make the process seamless. Our mission is
            to redefine how students match with residency programs,focusing on
            fit, personality, and potential rather than scores and number of
            publications.
          </p>
          <button className="px-18 py-2 rounded-lg bg-[#197EAB] text-white mt-10">
            Learn More
          </button>
        </div>
      </div>
      <div className="hidden div2 h-full w-[35%] md:flex items-center justify-center">
        <div className="lg:w-[80%] xl:w-[60%] md:w-[80%]">
          <img src={aboutimg} alt="" className=""/>
        </div>
      </div>
    </div>
  );
};

export default About;
