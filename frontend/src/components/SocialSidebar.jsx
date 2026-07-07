import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Floating social navigation sidebar (visible in hero section)
export default function SocialSidebar() {
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
