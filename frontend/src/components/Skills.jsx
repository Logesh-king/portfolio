import { useRef, useState } from 'react';
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

  // Fallbacks if data is not populated
  const defaultSkills = [
    { name: "HTML", level: 95, icon_class: "fab fa-html5", icon_color: "#e34f26", category: "Inner", angle: 45, radius: 100, description: "Semantic, accessible, and structured web layouts" },
    { name: "CSS", level: 90, icon_class: "fab fa-css3-alt", icon_color: "#1572b6", category: "Inner", angle: 135, radius: 100, description: "Responsive grids, flexboxes, variables, and GPU animations" },
    { name: "JavaScript", level: 85, icon_class: "fab fa-js", icon_color: "#f7df1e", category: "Inner", angle: 225, radius: 100, description: "DOM mechanics, ES6 module scopes, and asynchronous fetching" },
    { name: "React JS", level: 90, icon_class: "fab fa-react", icon_color: "#61dafb", category: "Outer", angle: 0, radius: 155, description: "Component-driven lifecycle, custom state hooks, and virtual rendering" },
    { name: "Python", level: 90, icon_class: "fab fa-python", icon_color: "#3776ab", category: "Outer", angle: 72, radius: 155, description: "Backend logic, web API design, scripting, and system algorithms" },
    { name: "Django", level: 85, icon_class: "fas fa-code", icon_color: "#499d4a", category: "Outer", angle: 144, radius: 155, description: "REST APIs, MVC pattern, schema designs, and middleware" },
    { name: "PostgreSQL", level: 80, icon_class: "fas fa-database", icon_color: "#336791", category: "Outer", angle: 216, radius: 155, description: "Relational database schemas, optimized SQL queries, and table locks" },
    { name: "Git", level: 85, icon_class: "fab fa-git-alt", icon_color: "#f05032", category: "Outer", angle: 288, radius: 155, description: "Version control, branching strategies, and repository management" },
    { name: "GitHub", level: 85, icon_class: "fab fa-github", icon_color: "#ffffff", category: "Inner", angle: 315, radius: 100, description: "Remote workflow, review cycles, and actions pipelines" }
  ];

  const listSkills = skills && skills.length > 0 ? skills : defaultSkills;

  // Wheel groups
  const outerWheelNodes = listSkills.filter(s => s.category === 'Outer' || s.category === 'Core');
  const innerWheelNodes = listSkills.filter(s => s.category === 'Inner');
  
  // Progress bar list (Limit to some key technologies or show all)
  const progressSkills = listSkills.filter(s => s.level > 0);

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
