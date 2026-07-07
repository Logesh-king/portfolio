import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Education from '../components/Education';
import Contact from '../components/Contact';

export default function LandingPage({ aboutInfo, skills, projects, education, setActiveSection }) {
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
