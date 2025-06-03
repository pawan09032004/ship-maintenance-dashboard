import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { NotificationProvider } from '../../contexts/NotificationContext';
import Header from './Header';
import '../Layout/LayoutStyles.css';

const Layout = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/dashboard') return 'Dashboard';
    
    const navItems = [
      { path: '/', label: 'Dashboard' },
      { path: '/ships', label: 'Ships' },
      { path: '/components', label: 'Components' },
      { path: '/jobs', label: 'Jobs' },
      { path: '/calendar', label: 'Calendar' },
    ];
    
    const currentNavItem = navItems.find(item => 
      item.path !== '/' && currentPath.startsWith(item.path)
    );
    
    return currentNavItem ? currentNavItem.label : '';
  };

  return (
    <NotificationProvider>
      <div className="layout-container">
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Header */}
        <Header />

        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <div className="breadcrumb-wrapper">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="breadcrumb-item">Home</Link>
              {getCurrentPageTitle() !== 'Dashboard' && (
                <>
                  <span className="breadcrumb-separator" aria-hidden="true">/</span>
                  <span className="breadcrumb-item active">{getCurrentPageTitle()}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main id="main-content" className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
};

export default Layout; 