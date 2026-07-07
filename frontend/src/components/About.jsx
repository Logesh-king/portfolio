import { useState, useRef } from 'react';
import { useIntersection } from '../hooks/useIntersection';
import { getImageUrl } from '../services/api';
import { fallbackProfileImage } from '../utils/placeholders';

export default function About({ aboutInfo }) {
  const [counts, setCounts] = useState({ projects: 0, experience: 0, passion: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  if (!aboutInfo) {
    return null;
  }

  const targetProjects = aboutInfo.projects_completed || 0;
  const targetExperience = aboutInfo.years_experience || 0;
  const targetPassion = aboutInfo.passion_percentage || 0;

  useIntersection(
    sectionRef,
    (isIntersecting) => {
      if (isIntersecting && !hasAnimated) {
        setHasAnimated(true);

        const duration = 1500;
        const steps = 40;
        const intervalTime = duration / steps;
        
        let currentStep = 0;
        
        const timer = setInterval(() => {
          currentStep++;
          setCounts({
            projects: Math.min(targetProjects, Math.ceil((targetProjects / steps) * currentStep)),
            experience: Math.min(targetExperience, Math.ceil((targetExperience / steps) * currentStep)),
            passion: Math.min(targetPassion, Math.ceil((targetPassion / steps) * currentStep))
          });

          if (currentStep >= steps) {
            clearInterval(timer);
            setCounts({
              projects: targetProjects,
              experience: targetExperience,
              passion: targetPassion
            });
          }
        }, intervalTime);
      }
    },
    { threshold: 0.15, once: true }
  );

  const heading = aboutInfo.heading;
  const bio = aboutInfo.bio;
  
  const profileImg = getImageUrl(aboutInfo.profile_image) || fallbackProfileImage;

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-section ${hasAnimated ? 'about-active' : ''}`}
      aria-label="About Logesh M"
    >
      <div className="container">
        <div className="about-title-wrap">
          <h2 className="section-title">About Me</h2>
        </div>

        <div className="about-grid">
          {/* Visual Profile Column */}
          <div className="about-img-col">
            <div className="about-image-ring" aria-hidden="true">
              <div className="about-image-inner">
                <img src={profileImg} alt="Logesh M portrait illustration" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Text details and statistics column */}
          <div className="about-text-col">
            <h3 className="about-heading">{heading}</h3>
            <p className="hero-desc" style={{ margin: '18px 0', maxWidth: '100%', textAlign: 'left' }}>
              {bio}
            </p>

            <div className="tech-badges-grid">
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-html5" style={{ color: '#e34f26' }}></i> HTML
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-css3-alt" style={{ color: '#1572b6' }}></i> CSS
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-js" style={{ color: '#f7df1e' }}></i> JavaScript
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-react" style={{ color: '#61dafb' }}></i> React JS
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-python" style={{ color: '#3776ab' }}></i> Python
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fas fa-database" style={{ color: '#336791' }}></i> PostgreSQL
              </div>
              <div className="tech-badge interactive about-badge">
                <i className="fab fa-git-alt" style={{ color: '#f05032' }}></i> Git
              </div>
            </div>

            <div className="about-counters">
              <div className="about-counter-item">
                <span className="counter-number">{counts.projects}</span>
                <span className="counter-plus">+</span>
                <br />
                <span className="counter-label">Projects Completed</span>
              </div>
              <div className="about-counter-item">
                <span className="counter-number">{counts.experience}</span>
                <span className="counter-plus">+</span>
                <br />
                <span className="counter-label">Years Experience</span>
              </div>
              <div className="about-counter-item">
                <span className="counter-number">{counts.passion}</span>
                <span className="counter-plus">%</span>
                <br />
                <span className="counter-label">Passionate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
