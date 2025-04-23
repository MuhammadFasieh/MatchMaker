import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Features = () => {
  const { currentUser } = useAuth();

  return (
    <div className="">
      {/* Video Section */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {currentUser && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Hello Dr. {currentUser.firstName || ''}, ready to explore our features?
              </h2>
              <p className="text-blue-600">
                As a {currentUser.specialty || 'medical'} professional, you'll find these tools especially helpful for your residency applications.
              </p>
              <div className="mt-4">
                <Link to="/dashboard" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
          
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
            {/* Replace the src with your actual video URL */}
            <iframe 
              className="w-full h-full" 
              src="https://www.youtube.com/embed/your-video-id" 
              title="Feature Overview" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Our Features</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentUser 
              ? `Discover how our platform can help you streamline your application process for ${currentUser.specialty || 'medical'} residencies.`
              : "Discover how our platform can help you streamline your application process"
            }
          </p>
        </div>

        {/* Feature List */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Statement Builder</h3>
            <p className="text-gray-600">
              Our intuitive editor helps you craft compelling personal statements that highlight your unique qualities and experiences.
            </p>
            {currentUser && (
              <Link to="/personal-statement" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                Start your statement →
              </Link>
            )}
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Research Portfolio</h3>
            <p className="text-gray-600">
              Showcase your publications and research experience in a structured format that impresses admissions committees.
            </p>
            {currentUser && (
              <Link to="/research" className="mt-4 inline-block text-green-600 hover:text-green-800">
                Create portfolio →
              </Link>
            )}
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Program Finder</h3>
            <p className="text-gray-600">
              Discover and compare programs that match your interests, qualifications, and career goals.
            </p>
            {currentUser && (
              <Link to="/programs" className="mt-4 inline-block text-purple-600 hover:text-purple-800">
                Find programs →
              </Link>
            )}
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Tracker</h3>
            <p className="text-gray-600">
              Stay organized with deadlines, requirements, and status updates for all your applications in one place.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Preparation</h3>
            <p className="text-gray-600">
              Access resources and practice tools to help you prepare for program interviews and stand out from other applicants.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mentor Connection</h3>
            <p className="text-gray-600">
              Connect with mentors who have successfully navigated the application process and can provide guidance and feedback.
            </p>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Services</h2>
          
          <div className="bg-gray-50 rounded-lg p-8 shadow-md">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Streamlined Application Process</h3>
                <p className="text-gray-600 mb-6">
                  Our platform simplifies the complex application process, saving you time and reducing stress. With our organized approach, you can focus on creating quality content instead of managing logistics.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Guidance</h3>
                <p className="text-gray-600">
                  Benefit from resources developed by professionals who understand what admissions committees are looking for. Our templates and guides help you present your qualifications effectively.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Increased Success Rate</h3>
                <p className="text-gray-600 mb-6">
                  Users of our platform report higher acceptance rates to their desired programs. Our structured approach helps you create compelling applications that stand out from the competition.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Support</h3>
                <p className="text-gray-600">
                  From preparing your personal statement to tracking application deadlines, we provide support throughout the entire process. Our integrated tools work together to create a seamless experience.
                </p>
              </div>
            </div>
            
            {!currentUser && (
              <div className="mt-8 text-center">
                <p className="text-lg font-medium mb-4">Ready to get started?</p>
                <Link 
                  to="/signup" 
                  className="inline-block px-6 py-3 bg-[#197EAB] text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;