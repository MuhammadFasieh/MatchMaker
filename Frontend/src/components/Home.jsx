import React from "react";
import img1 from "../images/Home1.svg";
import About from "./About";
import aboutimg2 from "../images/aboutimg2.svg";
import Testimonials from "./Testimonials";
import Mission from "./Mission";
import Form from "./Form";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home font-inter px-[2rem] sm:px-0">
      <div className="heroSection min-h-[404px] w-full flex flex-col md:flex-row pt-[3rem] md:bg-white">
        <div className="div1 w-full md:w-[50%] flex items-center justify-center p-6 md:p-0">
          <div className="content max-w-md">
            {currentUser ? (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-800">
                  Welcome back, {currentUser.firstName || ''}!
                </h2>
                <p className="text-blue-600">
                  Continue building your perfect residency application.
                </p>
              </div>
            ) : null}
            
            <div
              className="headings text-[32px] lg:text-[38px] md:text-[30px] text-[#1E1E1E]"
              style={{
                fontWeight: 550,
                letterSpacing: "-2%",
                lineHeight: "120%",
              }}
            >
              <h1>Match with the Right</h1>
              <h1>Residency– Beyond</h1>
              <h1>Just Numbers</h1>
            </div>

            <div className="para text-[16px] lg:text-[18px] md:text-[14px] font-extralight pt-4 md:pt-5">
              <p>AI-driven tools and expert guidance to help</p>
              <p>you build a standout residency application-</p>
              <p>because matching is about more than just</p>
              <p>numbers.</p>
            </div>

            <div className="buttons flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-5 font-extralight">
              {currentUser ? (
                <Link to='/dashboard' className="w-full md:w-auto border px-8 lg:px-14 py-3 cursor-pointer md:py-2 rounded-lg bg-[#197EAB] text-white text-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to='/signup' className="w-full md:w-auto border px-8 lg:px-14 py-3 cursor-pointer md:py-2 rounded-lg bg-[#197EAB] text-white text-lg">
                  Sign Up
                </Link>
              )}
              <Link to='/features' className="w-full md:w-auto border px-8 lg:px-12 py-3 cursor-pointer md:py-2 rounded-lg text-[#197EAB] text-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="div2 w-full md:w-[50%] flex items-center justify-center md:bg-transparent">
          <div className="img lg:w-[500px] md:w-[350px] w-fit px-6 md:px-0 py-6 md:py-0">
            {img1 ? (
              <img
                src={img1}
                alt="Medical professionals in a lab"
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/3]flex items-center justify-center">
                <span className="text-gray-400">Image placeholder</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <About id='about'/>
      <div className="img flex items-center justify-center md:my-0 my-[3rem]">
        <img src={aboutimg2} alt="" className="w-fit h-fit" />
      </div>
      <Testimonials />
      <Mission />
      {!currentUser && <Form id='form'/>}
    </div>
  );
};

export default Home;
