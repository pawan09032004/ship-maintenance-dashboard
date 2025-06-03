import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSettings, FiLogOut, FiMenu, FiX, FiSearch, FiCalendar } from 'react-icons/fi';
import NotificationCenter from '../Notifications/NotificationCenter';
import '../Layout/HeaderStyles.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if nav link is active
  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  // Navigation links
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/ships', label: 'Ships' },
    { path: '/components', label: 'Components' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/calendar', label: 'Calendar' },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo and brand */}
        <div className="header-left">
          <Link to="/" className="header-logo">
            <svg 
              className="logo-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 9L12 5L21 9L12 13L3 9Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M21 9V15" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M17 11.5V17.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 13V19" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M7 11.5V17.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M3 9V15" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="logo-text">Ship Maintenance</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <FiX className="icon" />
            ) : (
              <FiMenu className="icon" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label === 'Calendar' && <FiCalendar className="nav-icon mr-1" />}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Header Actions */}
        <div className="header-right">
          {/* Search */}
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="search"
              placeholder="Search..."
              className="search-input"
              aria-label="Search"
            />
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <div className="profile-container">
            <button 
              className="profile-button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="avatar">
                {getUserInitials()}
              </div>
              <div className="user-info">
                <span className="user-email">{user?.email}</span>
                <span className="user-role">Administrator</span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="avatar-large">{getUserInitials()}</div>
                  <div className="user-info-large">
                    <span className="user-email-large">{user?.email}</span>
                    <span className="user-role-large">Administrator</span>
                  </div>
                </div>
                <div className="profile-dropdown-divider"></div>
                <ul className="profile-dropdown-menu">
                  <li>
                    <button className="profile-dropdown-item">
                      <FiSettings className="profile-dropdown-icon" />
                      <span>Settings</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className="profile-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="profile-dropdown-icon" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label === 'Calendar' && <FiCalendar className="mobile-nav-icon" />}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-nav-footer">
            <button 
              className="mobile-nav-button"
              onClick={handleLogout}
            >
              <FiLogOut className="mobile-nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 