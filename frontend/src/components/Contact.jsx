import { useState, useRef, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useIntersection } from '../hooks/useIntersection';

export default function Contact() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Auto-hide toast notification after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useIntersection(
    sectionRef,
    (isIntersecting) => {
      if (isIntersecting) {
        setIsActive(true);
      }
    },
    { threshold: 0.12, once: true }
  );

  // Mouse coordinate tracking for glow aura on card
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    const glow = glowRef.current;
    if (glow) {
      glow.style.opacity = '0';
    }
  };

  // Generate particles statically so they don't regenerate on typing
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 18; i++) {
      const size = Math.random() * 5 + 2;
      const left = `${Math.random() * 100}%`;
      const bottom = `${Math.random() * 30}px`;
      const duration = (Math.random() * 8 + 6).toFixed(1);
      const delay = (Math.random() * -12).toFixed(1);
      const isBlue = Math.random() > 0.5;
      const background = isBlue
        ? 'radial-gradient(circle, rgba(0, 183, 255, 0.7) 0%, transparent 80%)'
        : 'radial-gradient(circle, rgba(122, 75, 255, 0.6) 0%, transparent 80%)';
      arr.push({ size, left, bottom, duration, delay, background });
    }
    return arr;
  }, []);

  const streaks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const width = Math.random() * 80 + 40;
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 60}%`;
      const duration = (Math.random() * 4 + 3).toFixed(1);
      const delay = (Math.random() * -8).toFixed(1);
      const background = Math.random() > 0.5
        ? 'linear-gradient(90deg, transparent, rgba(0, 183, 255, 0.5), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(122, 75, 255, 0.5), transparent)';
      arr.push({ width, top, left, duration, delay, background });
    }
    return arr;
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when editing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const getCooldown = () => {
    try {
      return localStorage.getItem('last_contact_submit');
    } catch (e) {
      return null;
    }
  };

  const setCooldown = () => {
    try {
      localStorage.setItem('last_contact_submit', Date.now().toString());
    } catch (e) {
      // Ignore security exceptions for localStorage in iframe/private browsing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;

    // Frontend rate limiting check (30 seconds cooldown)
    const lastSubmit = getCooldown();
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 30000) {
      const remaining = Math.ceil((30000 - (Date.now() - parseInt(lastSubmit))) / 1000);
      showToast(`Please wait ${remaining}s before sending another message.`, 'error');
      return;
    }

    if (!validateForm()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setStatus('sending');

    try {
      // Connect to Django endpoint
      const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
      await axios.post(`${baseUrl}/api/contact/`, formData);

      setStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      setCooldown();
      showToast('Message sent successfully! I will get back to you soon.', 'success');

      // Reset button feedback status after 3.5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setStatus('error');
      
      let errorMsg = 'Failed to send message. Please try again.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (typeof err.response.data === 'object') {
          const keys = Object.keys(err.response.data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstVal = err.response.data[firstKey];
            errorMsg = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : `${firstKey}: ${firstVal}`;
          }
        }
      }
      
      showToast(errorMsg, 'error');
      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    }
  };

  return (
    <>
      <section
        id="contact"
        ref={sectionRef}
        className={isActive ? 'contact-active' : ''}
        aria-label="Contact Information"
      >
      <div className="contact-spotlight contact-spotlight-center" aria-hidden="true"></div>
      <div className="contact-spotlight contact-spotlight-1" aria-hidden="true"></div>
      <div className="contact-spotlight contact-spotlight-2" aria-hidden="true"></div>

      <div id="contact-particles" aria-hidden="true">
        {particles.map((p, idx) => (
          <div
            key={`particle-${idx}`}
            className="contact-particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              bottom: p.bottom,
              background: p.background,
              '--cp-dur': p.duration,
              '--cp-delay': p.delay
            }}
          />
        ))}
        {streaks.map((s, idx) => (
          <div
            key={`streak-${idx}`}
            className="contact-streak"
            style={{
              width: `${s.width}px`,
              height: '1.5px',
              top: s.top,
              left: s.left,
              background: s.background,
              '--s-dur': s.duration,
              '--s-delay': s.delay
            }}
          />
        ))}
      </div>

      <div className="container-large">
        <h2 className="section-title">Contact Me</h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.95rem', marginTop: '-1.5rem', marginBottom: '3rem', fontWeight: 300 }}>
          Let's build something amazing together.
        </p>

        <div className="contact-outer-card">
          <div
            className="contact-inner-card"
            id="contactInnerCard"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="contact-mouse-glow" id="contactMouseGlow" ref={glowRef} aria-hidden="true"></div>
            <div className="contact-divider" aria-hidden="true"></div>

            {/* LEFT COLUMN: INPUT FORM */}
            <form className="contact-form-col" id="contactForm" onSubmit={handleSubmit} noValidate>
              <h3 className="contact-form-title">Get In Touch</h3>
              <p className="contact-form-subtitle">Fill the form below and I will get back to you as soon as possible.</p>

              {/* Honeypot Spam Protection Field (hidden) */}
              <div className="contact-group-hp" aria-hidden="true">
                <input
                  id="cWebsite"
                  name="website"
                  type="text"
                  placeholder="Website"
                  value={formData.website}
                  onChange={handleInputChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <label htmlFor="cWebsite">Website</label>
              </div>

              {/* Name Field */}
              <div className="contact-group">
                <input
                  className={`contact-field ${errors.name ? 'invalid' : ''}`}
                  id="cName"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                />
                <label className="contact-label" htmlFor="cName">Your Name</label>
                <i className="fas fa-user contact-input-icon" aria-hidden="true"></i>
                {errors.name && <span className="contact-error-text" role="alert">{errors.name}</span>}
              </div>

              {/* Email Field */}
              <div className="contact-group">
                <input
                  className={`contact-field ${errors.email ? 'invalid' : ''}`}
                  id="cEmail"
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                />
                <label className="contact-label" htmlFor="cEmail">Your Email</label>
                <i className="fas fa-envelope contact-input-icon" aria-hidden="true"></i>
                {errors.email && <span className="contact-error-text" role="alert">{errors.email}</span>}
              </div>

              {/* Subject Field */}
              <div className="contact-group">
                <input
                  className={`contact-field ${errors.subject ? 'invalid' : ''}`}
                  id="cSubject"
                  name="subject"
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  autoComplete="off"
                />
                <label className="contact-label" htmlFor="cSubject">Subject</label>
                <i className="fas fa-tag contact-input-icon" aria-hidden="true"></i>
                {errors.subject && <span className="contact-error-text" role="alert">{errors.subject}</span>}
              </div>

              {/* Message Field */}
              <div className="contact-group has-textarea">
                <textarea
                  className={`contact-field ${errors.message ? 'invalid' : ''}`}
                  id="cMessage"
                  name="message"
                  placeholder="Your Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <label className="contact-label" htmlFor="cMessage">Your Message</label>
                <i className="fas fa-comment-dots contact-input-icon" aria-hidden="true"></i>
                {errors.message && <span className="contact-error-text" role="alert">{errors.message}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`btn-contact-send ${status === 'sending' ? 'sending' : ''} ${status === 'sent' ? 'sent' : ''} ${status === 'error' ? 'error' : ''}`}
                id="contactSendBtn"
                aria-label="Submit message form"
                disabled={status === 'sending'}
              >
                <i
                  className={
                    status === 'sending'
                      ? 'fas fa-spinner fa-spin'
                      : status === 'sent'
                      ? 'fas fa-check'
                      : status === 'error'
                      ? 'fas fa-exclamation-triangle'
                      : 'fas fa-paper-plane'
                  }
                  aria-hidden="true"
                ></i>
                <span>
                  {status === 'sending'
                    ? ' Sending...'
                    : status === 'sent'
                    ? ' Message Sent!'
                    : status === 'error'
                    ? ' Send Failed'
                    : ' Send Message'}
                </span>
              </button>
            </form>

            {/* RIGHT COLUMN: CONTACT DETAILS */}
            <div className="contact-info-col" role="region" aria-label="Contact Details">
              <div className="contact-avatar-wrap">
                <div className="contact-avatar" aria-hidden="true">
                  <div className="contact-avatar-ping"></div>
                  <div className="contact-avatar-ping" style={{ animationDelay: '0.8s' }}></div>
                  <div className="contact-avatar-ring"></div>
                  <div className="contact-avatar-inner">
                    <svg className="contact-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="38" r="18" fill="rgba(0,183,255,0.15)" stroke="#00B7FF" strokeWidth="1.5" />
                      <circle cx="44" cy="35" r="2.5" fill="#00B7FF" opacity="0.8" />
                      <circle cx="56" cy="35" r="2.5" fill="#00B7FF" opacity="0.8" />
                      <path d="M44 44 Q50 49 56 44" stroke="#00B7FF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M22 80 Q28 62 50 60 Q72 62 78 80" fill="rgba(0,183,255,0.1)" stroke="#00B7FF" strokeWidth="1.2" />
                      <rect x="30" y="72" width="12" height="2" rx="1" fill="#7a4bff" opacity="0.8" />
                      <rect x="45" y="72" width="20" height="2" rx="1" fill="#00B7FF" opacity="0.6" />
                      <rect x="33" y="77" width="18" height="2" rx="1" fill="#00B7FF" opacity="0.5" />
                      <rect x="54" y="77" width="10" height="2" rx="1" fill="#7a4bff" opacity="0.7" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className="contact-info-title">Contact Details</h3>
              <p className="contact-info-subtitle">Open to freelance work, internships, and full-time engineering roles.</p>

              <div className="contact-detail-cards">
                <a href="mailto:mllogesh2003@gmail.com" className="contact-detail-card" aria-label="Send email to Logesh">
                  <div className="detail-card-icon"><i class="fas fa-envelope"></i></div>
                  <div className="detail-card-text">
                    <span class="detail-card-label">Email</span>
                    <span class="detail-card-value">mllogesh2003@gmail.com</span>
                  </div>
                </a>

                <a href="tel:+916369455737" className="contact-detail-card" aria-label="Call phone number">
                  <div className="detail-card-icon"><i class="fas fa-phone"></i></div>
                  <div className="detail-card-text">
                    <span class="detail-card-label">Phone</span>
                    <span class="detail-card-value">+91 63694 55737</span>
                  </div>
                </a>

                <a
                  href="https://maps.google.com/?q=Salem,+Tamil+Nadu+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-detail-card"
                  aria-label="Open location Salem, Tamil Nadu, India on Google Maps"
                >
                  <div className="detail-card-icon"><i class="fas fa-map-marker-alt"></i></div>
                  <div className="detail-card-text">
                    <span class="detail-card-label">Location</span>
                    <span class="detail-card-value">Salem, Tamil Nadu, India</span>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/logesh2k03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-detail-card"
                  aria-label="Open LinkedIn profile"
                >
                  <div className="detail-card-icon"><i class="fab fa-linkedin-in"></i></div>
                  <div className="detail-card-text">
                    <span class="detail-card-label">LinkedIn</span>
                    <span class="detail-card-value">linkedin.com/in/logesh2k03</span>
                  </div>
                </a>

                <a
                  href="https://github.com/Logesh-king"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-detail-card"
                  aria-label="Open GitHub repository page"
                >
                  <div className="detail-card-icon"><i class="fab fa-github"></i></div>
                  <div className="detail-card-text">
                    <span class="detail-card-label">GitHub</span>
                    <span class="detail-card-value">github.com/Logesh-king</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>

      {/* Floating glassmorphic toast notification */}
      {toast.show && (
        <div className={`contact-toast ${toast.type}`} role="alert">
          <div className="contact-toast-content">
            <i className={`fas ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} contact-toast-icon`}></i>
            <span className="contact-toast-msg">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
