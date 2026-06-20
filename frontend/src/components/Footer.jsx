export default function Footer() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer role="contentinfo">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Personal Portfolio</h3>
          <p>
            I'm a passionate Full Stack Developer dedicated to crafting modern, responsive, and high-performance
            websites and applications.
          </p>
        </div>
        <div>
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-nav">
            <li>
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
            </li>
            <li>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
            </li>
            <li>
              <a href="#skills" onClick={(e) => handleNavClick(e, 'skills')}>Skills</a>
            </li>
            <li>
              <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>Projects</a>
            </li>
            <li>
              <a href="#education" onClick={(e) => handleNavClick(e, 'education')}>Education</a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="footer-col-title">Social Connect</h4>
          <div className="footer-social">
            <a href="https://www.instagram.com/logesh_m_l" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.facebook.com/ml.logesh.9" target="_blank" rel="noopener noreferrer" aria-label="Facebook Profile">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.linkedin.com/in/logesh2k03" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://github.com/Logesh-king" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copyright">© 2026 Logesh M. All Rights Reserved.</div>
    </footer>
  );
}
