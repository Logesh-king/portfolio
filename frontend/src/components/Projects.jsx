import { useRef, useState, useEffect } from 'react';
import { useIntersection } from '../hooks/useIntersection';

export default function Projects({ projects }) {

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const prevTranslate = useRef(0);

  useIntersection(
    sectionRef,
    (isIntersecting) => {
      if (isIntersecting) {
        setIsActive(true);
      }
    },
    { threshold: 0.1, once: true }
  );

  const getScrollLimit = () => {
    if (!trackRef.current || !viewportRef.current) return 0;
    const trackWidth = trackRef.current.scrollWidth;
    const viewportWidth = viewportRef.current.offsetWidth;
    return Math.max(0, trackWidth - viewportWidth + 20);
  };

  const slide = (direction) => {
    const limit = getScrollLimit();
    const slideAmount = 350;
    let nextTranslate = currentTranslate;

    if (direction === 'next') {
      nextTranslate -= slideAmount;
    } else {
      nextTranslate += slideAmount;
    }

    if (nextTranslate > 0) {
      nextTranslate = 0;
    } else if (Math.abs(nextTranslate) > limit) {
      nextTranslate = -limit;
    }

    setCurrentTranslate(nextTranslate);
  };

  // Mouse & Touch events for swipe
  const handleDragStart = (e) => {
    isDragging.current = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    prevTranslate.current = currentTranslate;
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX.current;
    let nextTranslate = prevTranslate.current + diff;

    // Apply elastic border constraint
    const limit = getScrollLimit();
    if (nextTranslate > 0) {
      nextTranslate = nextTranslate * 0.3;
    } else if (Math.abs(nextTranslate) > limit) {
      const over = Math.abs(nextTranslate) - limit;
      nextTranslate = -(limit + over * 0.3);
    }
    setCurrentTranslate(nextTranslate);
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const limit = getScrollLimit();
    let nextTranslate = currentTranslate;

    if (nextTranslate > 0) {
      nextTranslate = 0;
    } else if (Math.abs(nextTranslate) > limit) {
      nextTranslate = -limit;
    }

    setCurrentTranslate(nextTranslate);
  };

  // Card 3D tilt effects
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const cardHeight = cardRect.height;

    const cursorX = e.clientX - cardRect.left - cardWidth / 2;
    const cursorY = e.clientY - cardRect.top - cardHeight / 2;

    const maxTilt = 10;
    const angleX = -(cursorY / (cardHeight / 2)) * maxTilt;
    const angleY = (cursorX / (cardWidth / 2)) * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-10px) scale(1.025)`;
    card.style.transition = 'none';
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  // Resize handler to bound viewport
  useEffect(() => {
    const handleResize = () => {
      const limit = getScrollLimit();
      if (Math.abs(currentTranslate) > limit) {
        setCurrentTranslate(-limit);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTranslate]);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={isActive ? 'active' : ''}
      aria-label="Featured Projects Showcase"
    >
      <div className="projects-bg-glow" aria-hidden="true"></div>

      {/* Floating background backdrop icons */}
      <i className="fab fa-react floating-icon icon-react" aria-hidden="true"></i>
      <i className="fab fa-python floating-icon icon-python" aria-hidden="true"></i>
      <i className="fab fa-html5 floating-icon icon-html" aria-hidden="true"></i>
      <i className="fab fa-css3-alt floating-icon icon-css" aria-hidden="true"></i>
      <i className="fab fa-js floating-icon icon-js" aria-hidden="true"></i>
      <i className="fas fa-database floating-icon icon-postgres" aria-hidden="true"></i>
      <i className="fas fa-code floating-icon icon-django" aria-hidden="true"></i>

      <div className="projects-header">
        <div className="projects-bg-text" aria-hidden="true">
          Master Projects
        </div>
        <h2 className="section-title">Projects</h2>
      </div>

      <div className="carousel-container">
        <button
          className="carousel-arrow prev"
          onClick={() => slide('prev')}
          aria-label="Show previous project slide"
          style={{ opacity: currentTranslate >= 0 ? 0.3 : 1 }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          className="carousel-arrow next"
          onClick={() => slide('next')}
          aria-label="Show next project slide"
          style={{ opacity: Math.abs(currentTranslate) >= getScrollLimit() ? 0.3 : 1 }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        <div
          className="carousel-viewport"
          ref={viewportRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          <div
            className="carousel-track"
            ref={trackRef}
            role="list"
            style={{
              transform: `translateX(${currentTranslate}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {projects.map((project, idx) => {
              const tagsArray = typeof project.tags === 'string' ? project.tags.split(',').map(t => t.trim()) : (project.tags || []);
              
              let imagePath = project.image || "/assets/images/smart_life_analyzer.png";
              
              return (
                <div
                  key={project.id || idx}
                  className={`project-card ${project.is_featured ? 'featured-card' : ''}`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  role="listitem"
                >
                  {project.is_featured && (
                    <>
                      <div className="featured-border-anim" aria-hidden="true"></div>
                      <div className="featured-tag">Featured</div>
                      <div className="featured-spotlight" aria-hidden="true"></div>
                    </>
                  )}

                  <div className="featured-inner-card">
                    <div className="card-sweep-container" aria-hidden="true">
                      <div className="card-sweep"></div>
                    </div>
                    <div className="project-img-wrapper">
                      <img
                        src={imagePath}
                        alt={`Dashboard preview of ${project.title}`}
                        className="project-img"
                        loading="lazy"
                        onDragStart={(e) => e.preventDefault()}
                      />
                    </div>
                    <h3 className="project-title">{project.title}</h3>

                    <div className="project-tags">
                      {tagsArray.map((tag, tagIdx) => (
                        <span key={tagIdx} className="tech-badge interactive">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="project-desc">{project.description}</p>

                    <div className="project-stats-list">
                      {project.features && (
                        <div className="stat-item">
                          <span className="stat-label">Features:</span>
                          <span className="stat-value">{project.features}</span>
                        </div>
                      )}
                      {project.techs_used && (
                        <div className="stat-item">
                          <span className="stat-label">Techs Used:</span>
                          <span className="stat-value">{project.techs_used}</span>
                        </div>
                      )}
                      <div className="stat-item">
                        <span className="stat-label">Status:</span>
                        <span
                          className={`stat-badge ${
                            project.status === 'Completed' ? 'status-completed' : 'status-in-progress'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <div className="project-btn-row">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-proj btn-proj-demo"
                        >
                          <i className="fas fa-external-link-alt"></i> Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-proj btn-proj-code"
                        >
                          <i className="fab fa-github"></i> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
