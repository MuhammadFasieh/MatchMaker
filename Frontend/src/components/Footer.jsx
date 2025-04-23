import React from 'react';
import logo from '../images/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-white pt-12 pb-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
        {/* Social Media Icons Row */}
        <div className="flex items-center mb-8">
          <a href="https://twitter.com" className="text-[#197EAB] mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M4 4l7.07 17L15 11l4 6 5-17H4z"></path>
            </svg>
          </a>
          <a href="https://instagram.com" className="text-[#197EAB] mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://youtube.com" className="text-[#197EAB] mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a href="https://linkedin.com" className="text-[#197EAB]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>

        {/* Main Footer Content - Desktop View */}
        <div className="hidden md:flex items-between justify-center gap-[8vw]">
          {/* Logo Column */}
          <div className="w-fit relative right-[2.3rem]">
            <a href="/" className="block mb-6">
              <img src={logo} alt="" className='h-[10rem] w-[10rem]'/>
            </a>
          </div>

          {/* Use Cases Column */}
          <div className="w-[fit]">
            <h3 className="text-gray-800 font-medium mb-4">Use cases</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-700 hover:text-blue-500">Home</a></li>
              <li><a href="/about" className="text-gray-700 hover:text-blue-500">About Us</a></li>
              <li><a href="/features" className="text-gray-700 hover:text-blue-500">Features</a></li>
              <li><a href="/dashboard" className="text-gray-700 hover:text-blue-500">Dashboard</a></li>
              <li><a href="/programs" className="text-gray-700 hover:text-blue-500">Find Programs</a></li>
            </ul>
          </div>

          {/* Application Sections Column */}
          <div className="w-[fit]">
            <h3 className="text-gray-800 font-medium mb-4">Application Sections</h3>
            <ul className="space-y-3">
              <li><a href="/personal-statement" className="text-gray-700 hover:text-blue-500">Personal Statement</a></li>
              <li><a href="/research" className="text-gray-700 hover:text-blue-500">Research & Publications</a></li>
              <li><a href="/experiences" className="text-gray-700 hover:text-blue-500">Experiences</a></li>
              <li><a href="/questions" className="text-gray-700 hover:text-blue-500">Design Miscellaneous Questions</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="w-[fit]">
            <h3 className="text-gray-800 font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/blog" className="text-gray-700">Blog</a></li>
              <li><a href="/best-practices" className="text-gray-700">Best practices</a></li>
              <li><a href="/support" className="text-gray-700">Support</a></li>
              <li><a href="/library" className="text-gray-700">Resource library</a></li>
            </ul>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {/* Logo already shown at the top with social media icons */}
          
          {/* Use Cases Section */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-medium mb-4">Use cases</h3>
            <ul className="space-y-4">
              <li><a href="/" className="text-[#1E1E1E]">Home</a></li>
              <li><a href="/about" className="text-[#1E1E1E]">About Us</a></li>
              <li><a href="/features" className="text-[#1E1E1E]">Features</a></li>
              <li><a href="/dashboard" className="text-[#1E1E1E]">Dashboard</a></li>
              <li><a href="/programs" className="text-[#1E1E1E]">Find Programs</a></li>
            </ul>
          </div>
          
          {/* Application Sections */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-bold mb-4">Application Sections</h3>
            <ul className="space-y-4">
              <li><a href="/personal-statement" className="text-[#1E1E1E]">Personal Statement</a></li>
              <li><a href="/research" className="text-[#1E1E1E]">Research & Publications</a></li>
              <li><a href="/experiences" className="text-[#1E1E1E]">Experiences</a></li>
              <li><a href="/questions" className="text-[#1E1E1E]">Design Miscellaneous Questions</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-gray-800 font-bold mb-4">Resources</h3>
            <ul className="space-y-4">
              <li><a href="/blog" className="text-[#1E1E1E]">Blog</a></li>
              <li><a href="/best-practices" className="text-[#1E1E1E]">Best practices</a></li>
              <li><a href="/support" className="text-[#1E1E1E]">Support</a></li>
              <li><a href="/library" className="text-[#1E1E1E]">Resource library</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;