import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

// Sample initial notifications for demonstration
const initialNotifications = [
  {
    id: 1,
    title: 'Maintenance Alert',
    message: 'Scheduled maintenance for Ship A is due in 3 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    priority: 'high',
    type: 'maintenance_alert'
  },
  {
    id: 2,
    title: 'Component Update',
    message: 'Engine parts for Ship B have been delivered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    priority: 'medium',
    type: 'component_update'
  },
  {
    id: 3,
    title: 'Job Completed',
    message: 'Hull inspection for Ship C has been completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    priority: 'low',
    type: 'job_completed'
  },
  {
    id: 4,
    title: 'System Update',
    message: 'Dashboard software has been updated to version 2.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    priority: 'info',
    type: 'system_update'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : initialNotifications;
  });
  
  const [filters, setFilters] = useState({
    types: [],
    priorities: [],
    readStatus: null // null = all, true = read only, false = unread only
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    return newNotification.id; // Return the ID for potential future reference
  };

  // Mark a specific notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Remove a specific notification
  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };
  
  // Remove all notifications
  const removeAllNotifications = () => {
    setNotifications([]);
  };
  
  // Remove notifications by type
  const removeNotificationsByType = (type) => {
    setNotifications(prev => 
      prev.filter(notif => notif.type !== type)
    );
  };
  
  // Update notification filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Apply filters to get filtered notifications
  const getFilteredNotifications = () => {
    return notifications.filter(notif => {
      // Filter by type if types filter is not empty
      if (filters.types.length > 0 && !filters.types.includes(notif.type)) {
        return false;
      }
      
      // Filter by priority if priorities filter is not empty
      if (filters.priorities.length > 0 && !filters.priorities.includes(notif.priority)) {
        return false;
      }
      
      // Filter by read status if readStatus is not null
      if (filters.readStatus !== null && notif.read !== filters.readStatus) {
        return false;
      }
      
      return true;
    });
  };

  // Get count of unread notifications
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };
  
  // Get most recent notification
  const getMostRecentNotification = () => {
    if (notifications.length === 0) return null;
    
    return notifications.reduce((latest, current) => {
      const latestDate = new Date(latest.timestamp);
      const currentDate = new Date(current.timestamp);
      return currentDate > latestDate ? current : latest;
    }, notifications[0]);
  };

  const value = {
    notifications,
    filteredNotifications: getFilteredNotifications(),
    filters,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllNotifications,
    removeNotificationsByType,
    updateFilters,
    getUnreadCount,
    getMostRecentNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 