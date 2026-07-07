import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Education from '../components/Education';
import Contact from '../components/Contact';
import { fetchPortfolioData } from '../services/api';

export default function LandingPage({ setActiveSection }) {
  const location = useLocation();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPortfolioData();
      setPortfolioData(data);
    } catch (err) {
      console.error("Error loading portfolio data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
  }, [setActiveSection, location, loading]); // Depend on loading so that sections are tracked after they render

  if (loading) {
    return (
      <div id="loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <div className="loader-ring"></div>
        <div className="loading-text" style={{ color: 'var(--neon-blue)', letterSpacing: '2px', fontWeight: 600 }}>
          LOADING PORTFOLIO...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        color: 'var(--text-light)',
        textAlign: 'center',
        padding: '20px',
        background: 'var(--bg-dark)'
      }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#ff4a4a', marginBottom: '20px' }}></i>
        <h2>Failed to Load Portfolio Content</h2>
        <p style={{ margin: '15px 0 25px 0', maxWidth: '500px', color: '#999', lineHeight: '1.6' }}>
          We encountered an error fetching the portfolio data. Please check your internet connection or backend server status and try again.
        </p>
        <button onClick={loadData} className="btn-neon" style={{ cursor: 'pointer', padding: '12px 24px', border: '1px solid var(--neon-blue)', background: 'transparent', borderRadius: '4px', color: 'var(--neon-blue)', transition: '0.3s' }}>
          <i className="fas fa-redo" style={{ marginRight: '8px' }}></i> Retry Loading
        </button>
      </div>
    );
  }

  return (
    <>
      <Hero aboutInfo={portfolioData?.about} />
      <About aboutInfo={portfolioData?.about} />
      <Skills skills={portfolioData?.skills} />
      <Projects projects={portfolioData?.projects} />
      <Education education={portfolioData?.education} />
      <Contact />
    </>
  );
}

