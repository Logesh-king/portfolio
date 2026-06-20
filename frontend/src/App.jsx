import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';

// Visual components
import Starfield from './components/Starfield';
import CursorGlow from './components/CursorGlow';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page components
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// Style imports
import './styles/style.css';

// Floating social navigation sidebar (visible in hero section)
function SocialSidebar() {
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('home');
      if (hero) {
        const threshold = hero.offsetHeight * 0.5;
        if (window.scrollY < threshold) {
          setIsHidden(false);
        } else {
          setIsHidden(true);
        }
      }
    };
    
    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    } else {
      setIsHidden(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  if (isHidden) return null;

  return (
    <div className="social-sidebar">
      <div role="navigation" aria-label="Social Sidebar Links">
        <a href="https://www.instagram.com/logesh_m_l" target="_blank" rel="noopener noreferrer" aria-label="Follow Logesh on Instagram">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://www.facebook.com/ml.logesh.9" target="_blank" rel="noopener noreferrer" aria-label="Follow Logesh on Facebook">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://www.linkedin.com/in/logesh2k03" target="_blank" rel="noopener noreferrer" aria-label="Connect with Logesh on LinkedIn">
          <i className="fab fa-linkedin-in"></i>
        </a>
        <a href="https://github.com/Logesh-king" target="_blank" rel="noopener noreferrer" aria-label="View Logesh's GitHub Profile">
          <i className="fab fa-github"></i>
        </a>
      </div>
    </div>
  );
}

// Landing page view combining sections
function LandingPage({ aboutInfo, skills, projects, education, setActiveSection }) {
  const location = useLocation();

  useEffect(() => {
    // Dynamic Active Section Tracker
    const sections = document.querySelectorAll('section');
    const observerOptions = {
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, [setActiveSection, location]);

  return (
    <>
      <Hero aboutInfo={aboutInfo} />
      <About aboutInfo={aboutInfo} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Education education={education} />
      <Contact />
    </>
  );
}

function MainApp() {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [aboutRes, skillsRes, projectsRes, eduRes] = await Promise.all([
          axios.get(`${baseUrl}/api/about/`),
          axios.get(`${baseUrl}/api/skills/`),
          axios.get(`${baseUrl}/api/projects/`),
          axios.get(`${baseUrl}/api/education/`),
        ]);
        
        setAboutInfo(aboutRes.data);
        setSkills(skillsRes.data);
        setProjects(projectsRes.data);
        setEducation(eduRes.data);
      } catch (err) {
        console.error("Error fetching data from API:", err);
      }
    };

    fetchPortfolioData();
  }, [location]);

  return (
    <>
      <CursorGlow />
      <Starfield />
      <SocialSidebar />
      {location.pathname !== '/admin-dashboard' && <Navbar activeSection={activeSection} />}
      
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
