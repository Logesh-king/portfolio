import { useState, useEffect } from 'react';

export default function Hero({ aboutInfo }) {
  const [typedText, setTypedText] = useState('');
  const strings = [
    'Full Stack Developer',
    'Frontend Developer',
    'Django Backend Developer'
  ];

  useEffect(() => {
    let idx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId = null;

    const type = () => {
      const currentString = strings[idx];
      if (!isDeleting) {
        setTypedText(currentString.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentString.length) {
          isDeleting = true;
          timeoutId = setTimeout(type, 2000);
        } else {
          timeoutId = setTimeout(type, 100);
        }
      } else {
        setTypedText(currentString.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          idx = (idx + 1) % strings.length;
          timeoutId = setTimeout(type, 400);
        } else {
          timeoutId = setTimeout(type, 50);
        }
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleContactClick = (e) => {
    e.preventDefault();
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const name = aboutInfo?.full_name || "LOGESH M";
  const bio = aboutInfo?.bio || "I'm a passionate Full Stack Developer dedicated to crafting modern, responsive, and user-friendly websites and applications. I specialize in React.js, Django, and PostgreSQL to build high-performance web systems.";
  const resumeUrl = aboutInfo?.resume_file || "/assets/resume/Logesh_Resume.pdf";

  return (
    <section id="home" className="hero-section" aria-label="Hero Introduction">
      <div className="hero-content">
        <h1 className="hero-title">
          HI, I'M <br />
          <span className="hero-title-name">{name.toUpperCase()}</span>
        </h1>
        <div className="hero-subtitle">
          <span id="typing-text">{typedText}</span>
        </div>
        <p className="hero-desc">{bio}</p>
        <div className="hero-buttons">
          <a href="#contact" onClick={handleContactClick} className="btn-neon">
            <i className="fas fa-paper-plane"></i> Contact Me
          </a>
          <a
            href={resumeUrl}
            download="Logesh_Resume.pdf"
            className="btn-neon"
            aria-label="Download Logesh's CV Resume"
          >
            <i className="fas fa-download"></i> Download Resume
          </a>
        </div>
      </div>
    </section>
  );
}
