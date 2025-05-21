import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import MatchMakerForm from './components/MatchMakerForm'
import PersonalStatement from './components/PersonalStatement1'
import Form from './components/Form'
import PersonalStatComp from './components/PersonalStatComp'
import FindingPrograms from './components/FindingPrograms'
import ResearchPublications from './components/ResearchPublications'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Footer from './components/Footer'
import Experiences from './components/Experiences'
import MiscellaneousQuestions from './components/MiscellaneousQuestions'
import Dashboard from './components/Dashboard'
import ContactUs from './components/ContactUs'
import Features from './components/Features'
import { useAuth } from './context/AuthContext'

const App = () => {
  const { currentUser } = useAuth();

  const router = createBrowserRouter([
    {
      path:'/',
      element:
      <div>
        <Navbar/>
        <Home/>
        <Footer/>
      </div>
    },
    {
      path:'/login',
      element: currentUser ? 
        <Navigate to="/" /> :
        <div>
          <Form/>
        </div>
    },
    {
      path:'/programs',
      element:
      <div>
        <Navbar/>
        <FindingPrograms/>
        <Footer/>
      </div>
    },
    {
      path:'/personal-statement',
      element:
      <div>
        <Navbar/>
        <PersonalStatComp/>
        <Footer/>
      </div>
    },
    {
      path:'/experiences',
      element:
      <div>
        <Navbar/>
        <Experiences/>
        <Footer/>
      </div>
    },
    {
      path:'/signup',
      element: currentUser ? 
        <Navigate to="/" /> :
        <div>
          <Navbar/>
          <MatchMakerForm/>
          <Footer/>
        </div>
    },
    {
      path:'/questions',
      element:
      <div>
        <Navbar/>
        <MiscellaneousQuestions/>
        <Footer/>
      </div>
    },
    {
      path:'/misc-questions',
      element:
      <div>
        <Navbar/>
        <MiscellaneousQuestions/>
        <Footer/>
      </div>
    },
    {
      path:'/program-preferences',
      element:
      <div>
        <Navbar/>
        <FindingPrograms/>
        <Footer/>
      </div>
    },
    {
      path:'/research',
      element:
      <div>
        <Navbar/>
        <ResearchPublications/>
        <Footer/>
      </div>
    },
    {
      path:'/dashboard',
      element:
      <div>
        <Navbar/>
        <Dashboard/>
        <Footer/>
      </div>
    },
    {
      path:'/contactus',
      element:
      <div>
        <Navbar/>
        <ContactUs/>
        <Footer/>
      </div>
    },
    {
      path:'/features',
      element:
      <div>
        <Navbar/>
        <Features/>
        <Footer/>
      </div>
    },
    {
      path:'*',
      element: <Navigate to="/" />
    }
  ]);

  return (
    <div className='bg-[#197EAB17] font-i'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
