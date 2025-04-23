import React, { useState, useRef, useEffect } from 'react';
import logo from '../images/logo.svg'
import { NavLink, useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 1080);
  const dropdownRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle resize to check viewport width
  useEffect(() => {
    function handleResize() {
      setIsDesktopView(window.innerWidth >= 1080);
      if (window.innerWidth >= 1080) {
        setIsMobileMenuOpen(false);
      }
    }
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close mobile dropdown when closing the mobile menu
    if (isMobileMenuOpen) {
      setIsMobileDropdownOpen(false);
    }
  };

  const toggleDesktopDropdown = () => {
    setIsDesktopDropdownOpen(!isDesktopDropdownOpen);
  };

  const toggleMobileDropdown = (e) => {
    // Stop event propagation to prevent closing the mobile menu when clicking dropdown
    e.stopPropagation();
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  const handleLogout = () => {
    // Call the logout function from auth context
    logout();
    
    // Show success message
    alert('Successfully logged out!');
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 lg:px-6" style={{ maxWidth: '1200px' }}>
        <div className="flex justify-between items-center h-[91px]">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink to='/' className="flex items-center">
              <img src={logo} alt="" />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className={`${isDesktopView ? 'flex' : 'hidden'} items-center space-x-1`}>
            <NavLink to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Home</NavLink>
            <NavLink to="/features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Features</NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</NavLink>
                
                {/* Desktop Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={toggleDesktopDropdown}
                  >
                    Application Sections
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isDesktopDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <NavLink to="/personal-statement" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Personal Statement
                        </NavLink>
                        <NavLink to="/research" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Research & Publications
                        </NavLink>
                        <NavLink to="/experiences" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Experiences
                        </NavLink>
                        <NavLink to="/questions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Miscellaneous Questions
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                
                <NavLink to="/programs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Find Programs</NavLink>
              </>
            )}
            
            <NavLink to="/contactus" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Contact Us</NavLink>
            
            <div className="ml-4 flex items-center">
              {currentUser ? (
                <>
                  <span className="mr-3 text-gray-700 hidden sm:inline-block">
                    Hello, Dr. {currentUser.firstName || ''}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#197EAB] text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 mr-2">
                    Sign in
                  </NavLink>
                  <NavLink to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-[#197EAB] text-white">
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className={`${isDesktopView ? 'hidden' : 'flex'} items-center`}>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 z-50"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slide from Right */}
      <div 
        className={`fixed top-0 right-0 bottom-0 bg-white shadow-lg w-64 transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileMenuOpen && !isDesktopView ? 'translate-x-0' : 'translate-x-full'
        }`} 
        style={{ maxHeight: '100vh', overflowY: 'auto' }}
      >
        <div className="pt-20 px-2 pb-3 space-y-1">
          <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Home</NavLink>
          <NavLink to="/features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Features</NavLink>
          
          {currentUser && (
            <>
              <NavLink to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Dashboard</NavLink>
              
              {/* Mobile Dropdown Button */}
              <button 
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                onClick={toggleMobileDropdown}
              >
                <span>Application Sections</span>
                <svg 
                  className={`w-4 h-4 transform ${isMobileDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mobile Dropdown Content */}
              <div 
                className={`pl-4 overflow-hidden transition-all duration-200 ease-in-out ${
                  isMobileDropdownOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <NavLink to="/personal-statement" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Personal Statement
                </NavLink>
                <NavLink to="/research" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Research & Publications
                </NavLink>
                <NavLink to="/experiences" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Experiences
                </NavLink>
                <NavLink to="/questions" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Miscellaneous Questions
                </NavLink>
              </div>
              
              <NavLink to="/programs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Find Programs</NavLink>
            </>
          )}
          
          <NavLink to="/contactus" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Contact Us</NavLink>        
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {currentUser ? (
              <>
                <div className="flex items-center px-3 py-2 mb-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {currentUser.profileImage ? (
                      <img 
                        src={currentUser.profileImage} 
                        alt={`${currentUser.firstName || ''}'s profile`}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span>{currentUser.firstName?.charAt(0) || ''}{currentUser.lastName?.charAt(0) || ''}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">Dr. {currentUser.firstName || ''} {currentUser.lastName || ''}</div>
                    <div className="text-sm font-medium text-gray-500">{currentUser.email || ''}</div>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 rounded-md text-center text-base font-medium bg-[#197EAB] text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block w-full px-4 py-2 rounded-md text-center text-base font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 mb-2">
                  Sign in
                </NavLink>
                <NavLink to="/signup" className="block w-full px-4 py-2 rounded-md text-center text-base font-medium bg-[#197EAB] text-white">
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && !isDesktopView && (
        <div 
          className="fixed inset-0 transition-opacity duration-300 ease-in-out" style={{opacity: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
          onClick={toggleMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;