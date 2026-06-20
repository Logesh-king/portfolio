import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${baseUrl}/api/auth/token/`, credentials);
      const token = response.data.token;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUsername', credentials.username);
      
      // Redirect to Admin Dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      console.error("Authentication failed:", err);
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Network Error: Cannot connect to the server. Is the backend running?');
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.status === 400) {
        setError('Invalid username or password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <form onSubmit={handleLoginSubmit}>
          <div className="admin-logo-area">
            <div className="admin-logo-icon">
              <i className="fas fa-shield-halved"></i>
            </div>
            <h2 className="admin-sidebar-logo" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
              Admin Portal
            </h2>
            <p className="admin-label" style={{ textTransform: 'none', letterSpacing: '0.2px' }}>
              Secure authentication for dashboard access
            </p>
          </div>

          {error && (
            <div 
              className="admin-toast error" 
              style={{ 
                position: 'static', 
                minWidth: 'auto', 
                maxWidth: 'none', 
                marginBottom: '1.5rem',
                animation: 'none' 
              }}
            >
              <i className="fas fa-exclamation-triangle admin-toast-icon"></i>
              <span className="admin-toast-msg">{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="admin-input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label" htmlFor="cUsername">
              <i className="fas fa-user" style={{ marginRight: '6px' }}></i> Username
            </label>
            <input
              className="admin-input"
              id="cUsername"
              name="username"
              type="text"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Password Field */}
          <div className="admin-input-group" style={{ marginBottom: '2rem' }}>
            <label className="admin-label" htmlFor="cPassword">
              <i className="fas fa-lock" style={{ marginRight: '6px' }}></i> Password
            </label>
            <input
              className="admin-input"
              id="cPassword"
              name="password"
              type="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link 
              to="/" 
              className="admin-label" 
              style={{ 
                textDecoration: 'none', 
                textTransform: 'none', 
                color: 'var(--neon-blue)', 
                opacity: 0.8,
                transition: 'opacity 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <i className="fas fa-arrow-left"></i> Back to Portfolio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
