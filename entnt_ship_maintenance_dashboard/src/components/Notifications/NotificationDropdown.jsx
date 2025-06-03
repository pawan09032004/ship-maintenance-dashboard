import { useState, useRef, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import './NotificationStyles.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    getUnreadCount 
  } = useNotifications();
  
  const dropdownRef = useRef(null);
  const unreadCount = getUnreadCount();
  const [animateOut, setAnimateOut] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeWithAnimation();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close dropdown with animation
  const closeWithAnimation = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setAnimateOut(false);
    }, 200); // Match animation duration
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (isOpen) {
      closeWithAnimation();
    } else {
      setIsOpen(true);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    if (notifications.length > 0 && confirm('Are you sure you want to clear all notifications?')) {
      notifications.forEach(notification => removeNotification(notification.id));
    }
  };
  
  // Group notifications by day
  const groupNotificationsByDay = () => {
    const groups = {
      today: [],
      yesterday: [],
      older: []
    };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    notifications.forEach(notification => {
      const notifDate = new Date(notification.timestamp);
      notifDate.setHours(0, 0, 0, 0);
      
      if (notifDate.getTime() === now.getTime()) {
        groups.today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else {
        groups.older.push(notification);
      }
    });
    
    return groups;
  };
  
  const notificationGroups = groupNotificationsByDay();
  const hasNotifications = notifications.length > 0;

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="notification-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="notification-dropdown"
      >
        <FiBell className="notification-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          id="notification-dropdown" 
          className={`notification-dropdown ${animateOut ? 'animate-out' : ''}`}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notification-header">
            <h3 className="notification-title">Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="notification-action-btn" 
                  onClick={markAllAsRead}
                  aria-label="Mark all as read"
                >
                  <FiCheck className="notification-action-icon" />
                  <span>Mark all read</span>
                </button>
              )}
              {hasNotifications && (
                <button 
                  className="notification-action-btn text-red-500" 
                  onClick={clearAllNotifications}
                  aria-label="Clear all notifications"
                >
                  <FiTrash2 className="notification-action-icon" />
                  <span>Clear all</span>
                </button>
              )}
              <button 
                className="notification-close-btn" 
                onClick={closeWithAnimation}
                aria-label="Close notifications"
              >
                <FiX />
              </button>
            </div>
          </div>
          
          <div className="notification-body">
            {!hasNotifications ? (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="notification-groups">
                {notificationGroups.today.length > 0 && (
                  <div className="notification-group">
                    <div className="notification-group-header">Today</div>
                    <ul className="notification-list">
                      {notificationGroups.today.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                        />
                      ))}
                    </ul>
                  </div>
                )}
                
                {notificationGroups.yesterday.length > 0 && (
                  <div className="notification-group">
                    <div className="notification-group-header">Yesterday</div>
                    <ul className="notification-list">
                      {notificationGroups.yesterday.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                        />
                      ))}
                    </ul>
                  </div>
                )}
                
                {notificationGroups.older.length > 0 && (
                  <div className="notification-group">
                    <div className="notification-group-header">Older</div>
                    <ul className="notification-list">
                      {notificationGroups.older.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {hasNotifications && (
            <div className="notification-footer">
              <button className="view-all-btn">
                <span>View all notifications</span>
                <FiChevronRight className="view-all-icon" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 