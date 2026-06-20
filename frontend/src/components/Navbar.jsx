import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useScroll } from '../hooks/useScroll';

export default function Navbar({ activeSection }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll indicator and background class change
  useScroll(({ scrollY }) => {
    if (scrollY > 40) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e, targetId) => {
    closeMobileMenu();
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we are on an admin page, navigate to homepage section
      navigate(`/#${targetId}`);
    }
  };

  // Check if we need to scroll to hash on load/navigate
  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Skills', id: 'skills' },
    { label: 'Projects', id: 'projects' },
    { label: 'Education', id: 'education' },
    { label: 'Contact', id: 'contact' },
  ];

  const isAdminAuthenticated = !!localStorage.getItem('adminToken');

  return (
    <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
      <div className="nav-bg" aria-hidden="true"></div>
      
      <Link to="/" onClick={(e) => handleNavClick(e, 'home')} className="nav-logo" aria-label="Logesh Portfolio Home">
        Portfolio
      </Link>

      <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          const isActive = location.pathname === '/' && activeSection === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
        {isAdminAuthenticated ? (
          <li>
            <Link to="/admin-dashboard" onClick={closeMobileMenu} className="btn-admin-nav" style={{ padding: '4px 12px', border: '1px solid var(--neon-blue)', borderRadius: '4px', fontSize: '0.85rem' }}>
              Dashboard
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/login" onClick={closeMobileMenu} className="btn-admin-nav" style={{ opacity: 0.5, fontSize: '0.85rem' }}>
              Login
            </Link>
          </li>
        )}
      </ul>

      <button
        className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="nav-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
