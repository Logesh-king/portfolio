import { useRef, useState, useEffect } from 'react';
import { useIntersection } from '../hooks/useIntersection';

export default function Skills({ skills }) {
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

  if (!skills || skills.length === 0) {
    return null;
  }

  // Wheel groups
  const outerWheelNodes = skills.filter(s => s.category === 'Outer' || s.category === 'Core');
  const innerWheelNodes = skills.filter(s => s.category === 'Inner');
  
  // Progress bar list (Limit to some key technologies or show all)
  const progressSkills = skills.filter(s => s.level > 0);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`skills-section ${isActive ? 'active' : ''}`}
      aria-label="Skills & Technologies"
    >
      <div className="skills-particles-container" aria-hidden="true"></div>
      <div className="skills-bg-glow" aria-hidden="true"></div>

      <div className="container">
        <div className="skills-inner">
          <h2 className="section-title">
            <span className="title-spotlight" aria-hidden="true"></span>
            Skills
          </h2>

          <div className="skills-grid">
            {/* 3D Concentric Orbit Skill Wheel */}
            <div className="skills-wheel-col">
              <div className={`skills-wheel-outer ${isActive ? 'reveal-active' : ''}`} aria-hidden="true">
                <div className="wheel-ring-outer"></div>
                <div className="wheel-ring-inner"></div>
                <div className="wheel-core-pulsar">
                  <i className="fas fa-microchip"></i>
                </div>

                {/* Outer Circle Nodes */}
                {outerWheelNodes.map((node, idx) => (
                  <div
                    key={node.id || `outer-${idx}`}
                    className="wheel-node-item"
                    style={{
                      '--angle': `${node.angle}deg`,
                      '--radius': `${node.radius}px`,
                      '--radius-mobile': `${node.radius - 25}px`,
                      '--i': idx
                    }}
                  >
                    <i className={node.icon_class} style={{ color: node.icon_color || undefined }}></i>
                    <span className="node-tooltip">{node.name}</span>
                  </div>
                ))}

                {/* Inner Circle Nodes */}
                {innerWheelNodes.map((node, idx) => (
                  <div
                    key={node.id || `inner-${idx}`}
                    className="wheel-node-item"
                    style={{
                      '--angle': `${node.angle}deg`,
                      '--radius': `${node.radius}px`,
                      '--radius-mobile': `${node.radius - 15}px`,
                      '--i': outerWheelNodes.length + idx
                    }}
                  >
                    <i className={node.icon_class} style={{ color: node.icon_color || undefined }}></i>
                    <span className="node-tooltip">{node.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Progress bar list */}
            <div className="skills-progress-col">
              {progressSkills.map((skill) => (
                <div key={skill.id || skill.name} className="skill-card">
                  <div className="skill-progress-header">
                    <span>
                      <i
                        className={skill.icon_class}
                        style={{ color: skill.icon_color || undefined, marginRight: '8px' }}
                      ></i>{' '}
                      {skill.name}
                    </span>
                    <span>{skill.level}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-fill"
                      style={{
                        '--target-width': `${skill.level}%`,
                        width: isActive ? `${skill.level}%` : '0%'
                      }}
                    ></div>
                  </div>
                  {skill.description && (
                    <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px', display: 'block' }}>
                      {skill.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
