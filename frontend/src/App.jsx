import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { fetchPortfolioData } from './services/api';

// Visual components
import Starfield from './components/Starfield';
import CursorGlow from './components/CursorGlow';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SocialSidebar from './components/SocialSidebar';

// Page components
import LandingPage from './pages/LandingPage';
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Style imports
import './styles/style.css';

function MainApp() {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPortfolioData();
      if (!data.error) {
        setAboutInfo(data.aboutInfo);
        setSkills(data.skills);
        setProjects(data.projects);
        setEducation(data.education);
      }
    };
    loadData();
  }, [location]);

  return (
    <>
      <CursorGlow />
      <Starfield />
      <SocialSidebar />
      {location.pathname !== '/admin-dashboard' && <Navbar activeSection={activeSection} />}
      
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                aboutInfo={aboutInfo}
                skills={skills}
                projects={projects}
                education={education}
                setActiveSection={setActiveSection}
              />
            }
          />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
      
      {location.pathname !== '/admin-dashboard' && location.pathname !== '/login' && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
