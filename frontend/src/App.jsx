import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

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
