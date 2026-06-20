import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('about');
  const [aboutData, setAboutData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Search, filter and messaging states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  
  // Loading & Message states
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // 'success' | 'error'

  // Modal / Form Edit states
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Outer', level: 80, icon_class: 'fab fa-react', icon_color: '#61dafb', angle: 0, radius: 155, description: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', features: '', techs_used: '', status: 'Completed', live_url: '', github_url: '', is_featured: false, order: 0 });
  const [educationForm, setEducationForm] = useState({ year_range: '', title: '', institution: '', grade: '', grade_label: 'Graduation Index', progress_offset: 35.19 });
  
  const [editId, setEditId] = useState(null); // ID of record being edited (null for new creation)
  const [showModal, setShowModal] = useState(false); // To toggle form popup modal
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle state

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  // Verify authorization
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  // Axios helper configuration
  const getAuthHeaders = () => ({
    headers: { Authorization: `Token ${token}` },
  });

  const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [aboutRes, skillsRes, projectsRes, eduRes] = await Promise.all([
        axios.get(`${baseUrl}/api/about/`),
        axios.get(`${baseUrl}/api/skills/`),
        axios.get(`${baseUrl}/api/projects/`),
        axios.get(`${baseUrl}/api/education/`),
      ]);
      setAboutData(aboutRes.data);
      setSkills(skillsRes.data);
      setProjects(projectsRes.data);
      setEducation(eduRes.data);

      if (token) {
        const msgRes = await axios.get(`${baseUrl}/api/contacts/`, getAuthHeaders());
        setMessages(msgRes.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showFeedback("Failed to pull database content. Please sign in again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 4500);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/login');
  };

  // ABOUT SAVE
  const handleAboutUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = `${baseUrl}/api/about/${aboutData.id || 1}/`;
      await axios.put(endpoint, aboutData, getAuthHeaders());
      showFeedback("About Me information updated successfully!", "success");
    } catch (err) {
      console.error("About save error:", err);
      showFeedback("Error saving About info.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // GENERIC CRUD LOGIC
  const openModal = (tab, item = null) => {
    setEditId(item ? item.id : null);
    if (tab === 'skills') {
      setSkillForm(item || { name: '', category: 'Outer', level: 80, icon_class: 'fab fa-react', icon_color: '#61dafb', angle: 0, radius: 155, description: '' });
    } else if (tab === 'projects') {
      setProjectForm(item || { title: '', description: '', tags: '', features: '', techs_used: '', status: 'Completed', live_url: '', github_url: '', is_featured: false, order: 0 });
    } else if (tab === 'education') {
      setEducationForm(item || { year_range: '', title: '', institution: '', grade: '', grade_label: 'Graduation Index', progress_offset: 35.19 });
    }
    setShowModal(true);
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let endpoint = `${baseUrl}/api/${activeTab}/`;
      let payload = {};
      
      if (activeTab === 'skills') payload = skillForm;
      if (activeTab === 'projects') payload = projectForm;
      if (activeTab === 'education') payload = educationForm;

      if (editId) {
        await axios.put(`${endpoint}${editId}/`, payload, getAuthHeaders());
        showFeedback("Database entry updated successfully!", "success");
      } else {
        await axios.post(endpoint, payload, getAuthHeaders());
        showFeedback("New entry created successfully!", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Submit error:", err);
      showFeedback("Error processing request. Check inputs.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this database entry?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/${activeTab}/${id}/`, getAuthHeaders());
      showFeedback("Entry deleted successfully!", "success");
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      showFeedback("Error deleting entry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/contacts/${id}/`, getAuthHeaders());
      showFeedback("Message logs cleared.", "success");
      fetchData();
    } catch (err) {
      console.error("Message delete error:", err);
      showFeedback("Failed to delete message log.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMessageRead = async (id, currentStatus) => {
    setIsLoading(true);
    try {
      await axios.patch(`${baseUrl}/api/contacts/${id}/`, { is_read: !currentStatus }, getAuthHeaders());
      showFeedback(`Message marked as ${!currentStatus ? 'read' : 'unread'}.`, "success");
      fetchData();
    } catch (err) {
      console.error("Message update error:", err);
      showFeedback("Failed to update message status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    setShowMsgModal(true);
    if (!msg.is_read) {
      try {
        await axios.patch(`${baseUrl}/api/contacts/${msg.id}/`, { is_read: true }, getAuthHeaders());
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  // Filter messages based on search query and status dropdown
  const filteredMessages = messages.filter(msg => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query);
      
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'unread' ? !msg.is_read :
      msg.is_read;
      
    return matchesSearch && matchesFilter;
  });

  // Helper for human-readable tab titles
  const getTabTitle = (tab) => {
    if (tab === 'about') return 'About Info';
    if (tab === 'messages') return 'Contact Messages';
    return tab;
  };

  // Helper to fetch icon representing tabs
  const getTabIcon = (tab) => {
    if (tab === 'about') return 'fa-user-gear';
    if (tab === 'skills') return 'fa-screwdriver-wrench';
    if (tab === 'projects') return 'fa-briefcase';
    if (tab === 'education') return 'fa-graduation-cap';
    if (tab === 'messages') return 'fa-envelope-open-text';
    return 'fa-folder';
  };

  return (
    <div className="admin-dashboard-container">
      {/* Toast Alert Popups */}
      {feedback.message && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${feedback.type}`}>
            <i className={`fas ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} admin-toast-icon`}></i>
            <span className="admin-toast-msg">{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <span className="admin-sidebar-logo">Admin Panel</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark-muted)' }}>VITE & DJANGO</div>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          {['about', 'skills', 'projects', 'education', 'messages'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }}
              className={`admin-menu-item ${activeTab === tab ? 'active' : ''}`}
            >
              <i className={`fas ${getTabIcon(tab)}`}></i>
              <span style={{ textTransform: 'capitalize' }}>{getTabTitle(tab)}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="admin-btn admin-btn-danger" 
            style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.85rem' }}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Topbar Header */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="admin-menu-toggle" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Navigation Sidebar"
            >
              <i className={`fas ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
            <h2 className="admin-topbar-title" style={{ margin: 0, textTransform: 'capitalize', fontWeight: 600 }}>
              {getTabTitle(activeTab)}
            </h2>
          </div>

          <div className="admin-user-profile">
            <div className="admin-avatar">
              {(localStorage.getItem('adminUsername') || 'A')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }} className="admin-label">
              <span style={{ color: '#fff', fontWeight: 600 }}>{localStorage.getItem('adminUsername') || 'Admin User'}</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'none' }}>Super Administrator</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="admin-content">
          {/* Statistics Grid */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrap blue">
                <i className="fas fa-screwdriver-wrench"></i>
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-count">{skills.length}</span>
                <span className="admin-stat-label">Total Skills</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrap purple">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-count">{projects.length}</span>
                <span className="admin-stat-label">Projects</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrap green">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-count">{education.length}</span>
                <span className="admin-stat-label">timeline</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon-wrap orange">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-count">
                  {messages.length}
                  {messages.filter(m => !m.is_read).length > 0 && (
                    <span className="admin-unread-badge" style={{ fontSize: '0.8rem', marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 183, 255, 0.15)', color: 'var(--neon-blue)', border: '1px solid rgba(0, 183, 255, 0.3)' }}>
                      {messages.filter(m => !m.is_read).length} unread
                    </span>
                  )}
                </span>
                <span className="admin-stat-label">Messages</span>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
              <div style={{ color: 'var(--neon-blue)', textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin fa-3x" style={{ marginBottom: '1rem' }}></i>
                <div>Processing Database Query...</div>
              </div>
            </div>
          )}

          {/* ABOUT INFO CARD & LATEST MESSAGES */}
          {!isLoading && activeTab === 'about' && aboutData && (
            <div className="admin-dashboard-overview-grid">
              {/* Profile Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="fas fa-user-gear" style={{ color: 'var(--neon-blue)' }}></i> Edit Profile Parameters
                  </h3>
                </div>
                <div className="admin-card-body">
                  <form onSubmit={handleAboutUpdate} className="admin-form-grid">
                    <div className="admin-input-group">
                      <label className="admin-label">Full Name</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={aboutData.full_name || ''} 
                        onChange={e => setAboutData({...aboutData, full_name: e.target.value})} 
                        required 
                      />
                    </div>
                    
                    <div className="admin-input-group">
                      <label className="admin-label">Heading / Subtitle</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={aboutData.heading || ''} 
                        onChange={e => setAboutData({...aboutData, heading: e.target.value})} 
                        required 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">Biography Details</label>
                      <textarea 
                        className="admin-input admin-textarea" 
                        rows="5" 
                        value={aboutData.bio || ''} 
                        onChange={e => setAboutData({...aboutData, bio: e.target.value})} 
                        required 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Projects Completed count</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        value={aboutData.projects_completed} 
                        onChange={e => setAboutData({...aboutData, projects_completed: parseInt(e.target.value) || 0})} 
                        required 
                      />
                    </div>
                    
                    <div className="admin-input-group">
                      <label className="admin-label">Years of Experience</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        value={aboutData.years_experience} 
                        onChange={e => setAboutData({...aboutData, years_experience: parseInt(e.target.value) || 0})} 
                        required 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">Passion Percentage (%)</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        value={aboutData.passion_percentage} 
                        onChange={e => setAboutData({...aboutData, passion_percentage: parseInt(e.target.value) || 0})} 
                        required 
                      />
                    </div>

                    <div className="admin-form-full" style={{ marginTop: '1rem' }}>
                      <button type="submit" className="admin-btn admin-btn-primary">
                        <i className="fas fa-save"></i> Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Latest Messages Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="fas fa-envelope" style={{ color: 'var(--neon-purple)' }}></i> Latest Messages
                  </h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-dark-muted)', padding: '2rem 1rem' }}>
                      <i className="fas fa-inbox fa-2x" style={{ marginBottom: '0.8rem', opacity: 0.4 }}></i>
                      <div style={{ fontSize: '0.9rem' }}>No messages in inbox.</div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-latest-messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.slice(0, 3).map((msg) => (
                          <div 
                            key={`latest-${msg.id}`} 
                            className="admin-latest-msg-item"
                            onClick={() => handleOpenMessage(msg)}
                            style={{ 
                              padding: '0.85rem 1rem', 
                              borderRadius: '8px', 
                              background: 'rgba(255, 255, 255, 0.02)', 
                              border: '1px solid rgba(255, 255, 255, 0.05)', 
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.25s ease',
                              opacity: msg.is_read ? 0.75 : 1
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                              e.currentTarget.style.borderColor = 'var(--neon-purple)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{msg.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dark-muted)' }}>
                                {new Date(msg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '0.85rem', 
                              color: msg.is_read ? 'var(--text-secondary)' : '#fff', 
                              fontWeight: msg.is_read ? 'normal' : '600',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis' 
                            }}>
                              {msg.subject}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setActiveTab('messages')} 
                        className="admin-btn admin-btn-neon-outline" 
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                      >
                        <i className="fas fa-envelope-open-text"></i> View All Messages ({messages.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SKILLS TABLE CARD */}
          {!isLoading && activeTab === 'skills' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <i className="fas fa-screwdriver-wrench" style={{ color: 'var(--neon-blue)' }}></i> Skill Matrix Database
                </h3>
                <button onClick={() => openModal('skills')} className="admin-btn admin-btn-neon-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  <i className="fas fa-plus"></i> Add New Skill
                </button>
              </div>
              <div className="admin-card-body" style={{ padding: '1.25rem' }}>
                <div className="admin-table-wrapper admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Skill Name</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Visual Icon</th>
                        <th style={{ textAlignment: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dark-muted)', padding: '2rem' }}>
                            No skill metrics recorded in database.
                          </td>
                        </tr>
                      ) : (
                        skills.map((skill) => (
                          <tr key={skill.id}>
                            <td data-label="Skill Name" style={{ fontWeight: 600, color: '#fff' }}>{skill.name}</td>
                            <td data-label="Category">{skill.category}</td>
                            <td data-label="Level">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', minWidth: '60px', maxWidth: '100px' }}>
                                  <div style={{ background: 'var(--neon-blue)', height: '100%', width: `${skill.level}%` }}></div>
                                </div>
                                <span>{skill.level}%</span>
                              </div>
                            </td>
                            <td data-label="Visual Icon">
                              <i className={skill.icon_class} style={{ color: skill.icon_color || '#fff', marginRight: '8px', fontSize: '1.1rem' }}></i>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-dark-muted)' }}>{skill.icon_class}</span>
                            </td>
                            <td data-label="Actions" style={{ textAlign: 'right' }}>
                              <button onClick={() => openModal('skills', skill)} className="admin-action-btn edit" title="Edit Skill">
                                <i className="fas fa-pen-to-square"></i>
                              </button>
                              <button onClick={() => handleDelete(skill.id)} className="admin-action-btn delete" title="Delete Skill">
                                <i className="fas fa-trash-can"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS TABLE CARD */}
          {!isLoading && activeTab === 'projects' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <i className="fas fa-briefcase" style={{ color: 'var(--neon-blue)' }}></i> Software Projects Repository
                </h3>
                <button onClick={() => openModal('projects')} className="admin-btn admin-btn-neon-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  <i className="fas fa-plus"></i> Add New Project
                </button>
              </div>
              <div className="admin-card-body" style={{ padding: '1.25rem' }}>
                <div className="admin-table-wrapper admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Project Title</th>
                        <th>Status</th>
                        <th>Featured</th>
                        <th style={{ textAlignment: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dark-muted)', padding: '2rem' }}>
                            No software projects recorded in database.
                          </td>
                        </tr>
                      ) : (
                        projects.map((proj) => (
                          <tr key={proj.id}>
                            <td data-label="Order">{proj.order}</td>
                            <td data-label="Project Title" style={{ fontWeight: 600, color: '#fff' }}>{proj.title}</td>
                            <td data-label="Status">
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.8rem', 
                                background: proj.status === 'Completed' ? 'rgba(0, 255, 128, 0.08)' : 'rgba(255, 170, 0, 0.08)',
                                border: `1px solid ${proj.status === 'Completed' ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 170, 0, 0.2)'}`,
                                color: proj.status === 'Completed' ? '#00ff80' : '#ffaa00'
                              }}>
                                {proj.status}
                              </span>
                            </td>
                            <td data-label="Featured">
                              {proj.is_featured ? (
                                <span style={{ color: '#ffaa00', fontSize: '0.85rem' }}><i className="fas fa-star" style={{ marginRight: '4px' }}></i> Featured</span>
                              ) : (
                                <span style={{ color: 'var(--text-dark-muted)', fontSize: '0.85rem' }}>Standard</span>
                              )}
                            </td>
                            <td data-label="Actions" style={{ textAlign: 'right' }}>
                              <button onClick={() => openModal('projects', proj)} className="admin-action-btn edit" title="Edit Project">
                                <i className="fas fa-pen-to-square"></i>
                              </button>
                              <button onClick={() => handleDelete(proj.id)} className="admin-action-btn delete" title="Delete Project">
                                <i className="fas fa-trash-can"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EDUCATION TABLE CARD */}
          {!isLoading && activeTab === 'education' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <i className="fas fa-graduation-cap" style={{ color: 'var(--neon-blue)' }}></i> Education Timeline History
                </h3>
                <button onClick={() => openModal('education')} className="admin-btn admin-btn-neon-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  <i className="fas fa-plus"></i> Add Timeline Item
                </button>
              </div>
              <div className="admin-card-body" style={{ padding: '1.25rem' }}>
                <div className="admin-table-wrapper admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Years Range</th>
                        <th>Degree / Title</th>
                        <th>Institution</th>
                        <th>Grade</th>
                        <th style={{ textAlignment: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {education.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dark-muted)', padding: '2rem' }}>
                            No educational records in database.
                          </td>
                        </tr>
                      ) : (
                        education.map((edu) => (
                          <tr key={edu.id}>
                            <td data-label="Years Range">{edu.year_range}</td>
                            <td data-label="Degree / Title" style={{ fontWeight: 600, color: '#fff' }}>{edu.title}</td>
                            <td data-label="Institution">{edu.institution}</td>
                            <td data-label="Grade">
                              <span style={{ color: 'var(--neon-blue)', fontWeight: 500 }}>{edu.grade}</span>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark-muted)' }}>{edu.grade_label}</span>
                            </td>
                            <td data-label="Actions" style={{ textAlign: 'right' }}>
                              <button onClick={() => openModal('education', edu)} className="admin-action-btn edit" title="Edit Timeline">
                                <i className="fas fa-pen-to-square"></i>
                              </button>
                              <button onClick={() => handleDelete(edu.id)} className="admin-action-btn delete" title="Delete Timeline">
                                <i className="fas fa-trash-can"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT MESSAGES TAB */}
          {!isLoading && activeTab === 'messages' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <i className="fas fa-envelope-open-text" style={{ color: 'var(--neon-blue)' }}></i> Contact Messages Inbox
                </h3>
              </div>
              <div className="admin-card-body">
                {/* Search & Filter Toolbar */}
                <div className="admin-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div className="admin-search-wrap" style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-muted)', fontSize: '0.9rem' }}></i>
                    <input 
                      type="text" 
                      placeholder="Search by name, email, subject, or message..." 
                      className="admin-input" 
                      style={{ paddingLeft: '38px', width: '100%' }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="admin-filter-wrap" style={{ minWidth: '180px' }}>
                    <select 
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Messages ({messages.length})</option>
                      <option value="unread">Unread Only ({messages.filter(m => !m.is_read).length})</option>
                      <option value="read">Read Only ({messages.filter(m => m.is_read).length})</option>
                    </select>
                  </div>
                </div>

                {filteredMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-dark-muted)', padding: '3rem' }}>
                    <i className="fas fa-inbox fa-3x" style={{ marginBottom: '1rem', opacity: 0.5 }}></i>
                    <div>No messages found matching search/filter options.</div>
                  </div>
                ) : (
                  <div className="admin-table-wrapper admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '110px' }}>Status</th>
                          <th>Sender Details</th>
                          <th>Subject</th>
                          <th style={{ width: '180px' }}>Date Received</th>
                          <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMessages.map((msg) => (
                          <tr key={msg.id} style={{ opacity: msg.is_read ? 0.75 : 1, transition: 'opacity 0.25s' }}>
                            <td data-label="Status">
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600',
                                background: msg.is_read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 183, 255, 0.12)',
                                border: `1px solid ${msg.is_read ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 183, 255, 0.3)'}`,
                                color: msg.is_read ? 'var(--text-dark-muted)' : 'var(--neon-blue)'
                              }}>
                                {msg.is_read ? 'Read' : 'Unread'}
                              </span>
                            </td>
                            <td data-label="Sender Details">
                              <div style={{ fontWeight: 600, color: '#fff' }}>{msg.name}</div>
                              <div style={{ fontSize: '0.8rem' }}>
                                <a href={`mailto:${msg.email}`} style={{ color: 'var(--text-dark-muted)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                                  {msg.email}
                                </a>
                              </div>
                            </td>
                            <td data-label="Subject" style={{ fontWeight: msg.is_read ? 'normal' : '600', color: msg.is_read ? 'var(--text-secondary)' : '#fff', cursor: 'pointer' }} onClick={() => handleOpenMessage(msg)}>
                              <div className="text-truncate-subject" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {msg.subject}
                              </div>
                            </td>
                            <td data-label="Date Received" style={{ fontSize: '0.8rem' }}>
                              {new Date(msg.created_at).toLocaleString()}
                            </td>
                            <td data-label="Actions" style={{ textAlign: 'right' }}>
                              <button onClick={() => handleOpenMessage(msg)} className="admin-action-btn edit" title="Read Message">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                onClick={() => handleToggleMessageRead(msg.id, msg.is_read)} 
                                className="admin-action-btn edit" 
                                style={{ color: 'var(--neon-purple)' }}
                                title={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                              >
                                <i className={msg.is_read ? "fas fa-envelope" : "fas fa-envelope-open"}></i>
                              </button>
                              <button onClick={() => handleDeleteMessage(msg.id)} className="admin-action-btn delete" title="Delete Message">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CRUD FORM POPUP MODAL (Glassmorphic Card Overlay) */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <header className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editId ? `Modify ${activeTab.slice(0, -1)} entry` : `Register new ${activeTab.slice(0, -1)}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-modal-close" aria-label="Close modal">
                <i className="fas fa-xmark"></i>
              </button>
            </header>
            
            <form onSubmit={handleCrudSubmit}>
              <div className="admin-modal-body">
                {/* SKILLS FORM FIELDS */}
                {activeTab === 'skills' && (
                  <div className="admin-form-grid">
                    <div className="admin-input-group">
                      <label className="admin-label">Skill Name</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={skillForm.name} 
                        onChange={e => setSkillForm({...skillForm, name: e.target.value})} 
                        required 
                        placeholder="e.g. Django Rest Framework" 
                      />
                    </div>
                    
                    <div className="admin-input-group">
                      <label className="admin-label">Skill category</label>
                      <select 
                        className="admin-select" 
                        value={skillForm.category} 
                        onChange={e => setSkillForm({...skillForm, category: e.target.value})}
                      >
                        <option value="Core">Core</option>
                        <option value="Outer">Outer Circle</option>
                        <option value="Inner">Inner Circle</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Level / Proficiency (%)</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={skillForm.level} 
                        onChange={e => setSkillForm({...skillForm, level: parseInt(e.target.value) || 0})} 
                        required 
                      />
                    </div>
                    
                    <div className="admin-input-group">
                      <label className="admin-label">FontAwesome Icon Class</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={skillForm.icon_class} 
                        onChange={e => setSkillForm({...skillForm, icon_class: e.target.value})} 
                        required 
                        placeholder="e.g. fab fa-react" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Icon Color (Hex / Color Name)</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={skillForm.icon_color || ''} 
                        onChange={e => setSkillForm({...skillForm, icon_color: e.target.value})} 
                        placeholder="e.g. #61dafb" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Orbit Circle angle (degrees)</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        step="any" 
                        value={skillForm.angle} 
                        onChange={e => setSkillForm({...skillForm, angle: parseFloat(e.target.value) || 0})} 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Orbit Circle radius (px)</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        step="any" 
                        value={skillForm.radius} 
                        onChange={e => setSkillForm({...skillForm, radius: parseFloat(e.target.value) || 155})} 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">Brief Description details</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={skillForm.description || ''} 
                        onChange={e => setSkillForm({...skillForm, description: e.target.value})} 
                        placeholder="Brief summary of experience level"
                      />
                    </div>
                  </div>
                )}

                {/* PROJECTS FORM FIELDS */}
                {activeTab === 'projects' && (
                  <div className="admin-form-grid">
                    <div className="admin-input-group">
                      <label className="admin-label">Project Title</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={projectForm.title} 
                        onChange={e => setProjectForm({...projectForm, title: e.target.value})} 
                        required 
                        placeholder="e.g. E-Commerce Platform" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Sorting index order</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        value={projectForm.order} 
                        onChange={e => setProjectForm({...projectForm, order: parseInt(e.target.value) || 0})} 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">Description Narrative</label>
                      <textarea 
                        className="admin-input admin-textarea" 
                        rows="4" 
                        value={projectForm.description} 
                        onChange={e => setProjectForm({...projectForm, description: e.target.value})} 
                        required 
                        placeholder="Write a short pitch or description of the project"
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Tags / Stack (comma-separated)</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={projectForm.tags} 
                        onChange={e => setProjectForm({...projectForm, tags: e.target.value})} 
                        required 
                        placeholder="React, Django, PostgreSQL" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Project Status</label>
                      <select 
                        className="admin-select" 
                        value={projectForm.status} 
                        onChange={e => setProjectForm({...projectForm, status: e.target.value})}
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Features list (comma-separated)</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={projectForm.features || ''} 
                        onChange={e => setProjectForm({...projectForm, features: e.target.value})} 
                        placeholder="Authentication, Stripe Checkout, PDF Reports" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Tech Stack specifics (comma-separated)</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={projectForm.techs_used || ''} 
                        onChange={e => setProjectForm({...projectForm, techs_used: e.target.value})} 
                        placeholder="Tailwind CSS, Axios, Python, Redux" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Live Deployment URL</label>
                      <input 
                        className="admin-input" 
                        type="url" 
                        value={projectForm.live_url || ''} 
                        onChange={e => setProjectForm({...projectForm, live_url: e.target.value})} 
                        placeholder="https://example.com" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">GitHub Repository URL</label>
                      <input 
                        className="admin-input" 
                        type="url" 
                        value={projectForm.github_url || ''} 
                        onChange={e => setProjectForm({...projectForm, github_url: e.target.value})} 
                        placeholder="https://github.com/..." 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full" style={{ padding: '0.2rem 0' }}>
                      <label className="admin-checkbox-group" htmlFor="cFeatured">
                        <input 
                          type="checkbox" 
                          id="cFeatured" 
                          className="admin-checkbox"
                          checked={projectForm.is_featured} 
                          onChange={e => setProjectForm({...projectForm, is_featured: e.target.checked})} 
                        />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-white)' }}>Highlight as Featured Project</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* EDUCATION FORM FIELDS */}
                {activeTab === 'education' && (
                  <div className="admin-form-grid">
                    <div className="admin-input-group">
                      <label className="admin-label">Year Range</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={educationForm.year_range} 
                        onChange={e => setEducationForm({...educationForm, year_range: e.target.value})} 
                        required 
                        placeholder="e.g. 2021 - 2025" 
                      />
                    </div>
                    
                    <div className="admin-input-group">
                      <label className="admin-label">Degree / Course Title</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={educationForm.title} 
                        onChange={e => setEducationForm({...educationForm, title: e.target.value})} 
                        required 
                        placeholder="e.g. B.Tech Computer Science" 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">Institution Name</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={educationForm.institution} 
                        onChange={e => setEducationForm({...educationForm, institution: e.target.value})} 
                        required 
                        placeholder="e.g. Stanford University" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Score / Grade attained</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={educationForm.grade} 
                        onChange={e => setEducationForm({...educationForm, grade: e.target.value})} 
                        required 
                        placeholder="e.g. 9.2 CGPA / 92%" 
                      />
                    </div>

                    <div className="admin-input-group">
                      <label className="admin-label">Grade index label description</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={educationForm.grade_label} 
                        onChange={e => setEducationForm({...educationForm, grade_label: e.target.value})} 
                        required 
                        placeholder="e.g. Graduation Index / Class Score" 
                      />
                    </div>

                    <div className="admin-input-group admin-form-full">
                      <label className="admin-label">SVG Radial Stroke Offset (Progress Indicator)</label>
                      <input 
                        className="admin-input" 
                        type="number" 
                        step="any" 
                        value={educationForm.progress_offset} 
                        onChange={e => setEducationForm({...educationForm, progress_offset: parseFloat(e.target.value) || 0})} 
                        required 
                      />
                    </div>
                  </div>
                )}
              </div>

              <footer className="admin-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <i className="fas fa-check-double"></i> Save Record
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Message Reader Modal */}
      {showMsgModal && selectedMessage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '600px' }}>
            <header className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-envelope-open" style={{ color: 'var(--neon-blue)', marginRight: '8px' }}></i>
                Read Message
              </h3>
              <button 
                onClick={() => {
                  setShowMsgModal(false);
                  setSelectedMessage(null);
                  fetchData();
                }} 
                className="admin-modal-close" 
                aria-label="Close message reader"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </header>
            <div className="admin-modal-body" style={{ padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--neon-blue)', fontSize: '1.2rem' }}>{selectedMessage.subject}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dark-muted)' }}>From:</span>{' '}
                    <strong style={{ color: '#fff' }}>{selectedMessage.name}</strong>{' '}
                    <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--neon-purple)', textDecoration: 'underline' }}>
                      ({selectedMessage.email})
                    </a>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dark-muted)' }}>Date:</span>{' '}
                    <span style={{ color: '#ccc' }}>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dark-muted)' }}>Status:</span>{' '}
                    <span className={`status-badge-inline ${selectedMessage.is_read ? 'read' : 'unread'}`} style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: selectedMessage.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(0,183,255,0.1)',
                      color: selectedMessage.is_read ? '#888' : 'var(--neon-blue)',
                      border: `1px solid ${selectedMessage.is_read ? 'rgba(255,255,255,0.1)' : 'rgba(0,183,255,0.2)'}`
                    }}>
                      {selectedMessage.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="admin-message-reader-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e0e0e0', fontSize: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                {selectedMessage.message}
              </div>
            </div>
            <footer className="admin-modal-footer">
              <button 
                type="button" 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this message?")) {
                    setShowMsgModal(false);
                    await handleDeleteMessage(selectedMessage.id);
                  }
                }} 
                className="admin-btn admin-btn-danger"
              >
                <i className="fas fa-trash-alt"></i> Delete Message
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowMsgModal(false);
                  setSelectedMessage(null);
                  fetchData();
                }} 
                className="admin-btn admin-btn-secondary"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
