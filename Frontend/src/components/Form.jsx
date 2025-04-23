import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import img from '../images/img.svg'

const Form = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Only pass the email and password to the login function
      await login({ 
        email, 
        password
      });
      
      // Set success message
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id='form' className="min-h-screen flex items-center justify-center bg-blue-50 font-inter">
      <div className="w-full max-w-6xl flex overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-10 lg:p-16">
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome Back to MatchMaker!
          </h1>
          
          <p className="text-[20px] text-[#757575] tracking-wide mb-10">
            Stay on track and in control of your residency journey Whether you're a medical student or a future resident, we're here to help you craft the perfect application.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  {showPassword ? (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  ) : (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  )}
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-10">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#197EAB] rounded"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#197EAB] hover:underline">Forgot my password</Link>
            </div>
                        
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#197EAB] text-white py-3 px-4 rounded-2xl shadow-xl transition duration-300 disabled:bg-blue-300"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't have an account yet? <Link to="/signup" className="text-[#197EAB] hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
        
        {/* Right Side - Medical Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-[#197EAB] relative">
        <img src={img} alt="" className='h-full w-full object-cover'/>
        </div>
      </div>
    </div>
  );
};

export default Form;