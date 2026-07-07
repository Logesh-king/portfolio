import { useRef, useState, useEffect } from 'react';
import { useIntersection } from '../hooks/useIntersection';

export default function Education({ education }) {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useIntersection(
    sectionRef,
    (isIntersecting) => {
      if (isIntersecting) {
        setIsActive(true);
      }
    },
    { threshold: 0.15, once: true }
  );

  if (!education || education.length === 0) {
    return null;
  }

  return (
    <section
      id="education"
      ref={sectionRef}
      className={isActive ? 'active' : ''}
      aria-label="Education Timeline"
    >
      <div className="container">
        <h2 className="section-title">Education</h2>

        <div className="timeline-container">
          <div className="timeline-line" aria-hidden="true"></div>

          {education.map((item, idx) => {
            const isRightAligned = idx % 2 === 0;
            return (
              <div
                key={item.id || idx}
                className={`timeline-item ${isRightAligned ? 'right-aligned' : 'left-aligned'}`}
              >
                <div className="timeline-card">
                  <div className="timeline-year">{item.year_range}</div>
                  <h3 className="timeline-title">{item.title}</h3>
                  <div className="timeline-institution">{item.institution}</div>

                  <div className="timeline-progress-row">
                    <div className="radial-progress-container" aria-hidden="true">
                      <svg viewBox="0 0 36 36">
                        <circle className="radial-bg" cx="18" cy="18" r="16" />
                        <circle
                          className="radial-bar"
                          cx="18"
                          cy="18"
                          r="16"
                          style={{
                            '--target-offset': isActive ? item.progress_offset : 100.53 // Animate radial bar on reveal
                          }}
                        />
                      </svg>
                    </div>
                    <div className="timeline-progress-details">
                      <span className="timeline-progress-value">{item.grade}</span>
                      <span className="timeline-progress-label">{item.grade_label}</span>
                    </div>
                  </div>
                </div>
                <div className="timeline-dot" aria-hidden="true"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
