import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiAnchor, FiAlertCircle } from 'react-icons/fi';
import './LoginStyles.css';
import ParticleBackground from './ParticleBackground';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Add animation class when component mounts
  useEffect(() => {
    const card = document.querySelector('.glass-card');
    if (card) {
      // Force a reflow to ensure animation plays
      card.classList.remove('cardAppear');
      void card.offsetWidth;
      card.classList.add('cardAppear');
    }

    // Add focus to email input after animation completes
    setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.focus();
    }, 1000);
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!validateForm()) {
      document.querySelector('.glass-card').classList.add('shake');
      setTimeout(() => {
        document.querySelector('.glass-card').classList.remove('shake');
      }, 820);
      return;
    }
    
    setLoading(true);

    try {
      const success = login(email, password);
      if (success) {
        // Add success animation
        const button = document.querySelector('.submit-button');
        button.innerHTML = '<span style="color: white">✓</span>';
        button.style.background = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
        button.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.6)';
        
        setTimeout(() => {
          toast.success('Login successful!');
          navigate('/dashboard');
        }, 800);
      } else {
        setFormError('Invalid email or password');
        document.querySelector('.glass-card').classList.add('shake');
        setTimeout(() => {
          document.querySelector('.glass-card').classList.remove('shake');
        }, 820);
        toast.error('Invalid email or password');
      }
    } catch (error) {
      setFormError('An error occurred during login');
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ParticleBackground />
      
      <div className="glass-card">
        <div className="brand-logo">
          <FiAnchor className="logo-icon" />
        </div>
        
        <div className="brand-content">
          <h1 className="brand-title">Ship Maintenance Dashboard</h1>
          <p className="brand-subtitle">Sign in to access your account</p>
        </div>
        
        {formError && (
          <div className="error-message" role="alert">
            <FiAlertCircle />
            <span>{formError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email" className="visually-hidden">Email address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              aria-describedby={formError ? "form-error" : undefined}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="visually-hidden">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              aria-describedby={formError ? "form-error" : undefined}
            />
          </div>
          
          <div className="form-options">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="loading-state">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 