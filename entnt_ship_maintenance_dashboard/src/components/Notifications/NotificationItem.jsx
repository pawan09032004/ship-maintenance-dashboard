import { FiX, FiCheckCircle, FiEdit, FiPlusCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import PropTypes from 'prop-types';

const NotificationItem = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotifications();
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  // Get notification icon based on type or priority
  const getNotificationIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'job_created':
        return <FiPlusCircle className="notification-item-icon job-created" />;
      case 'job_updated':
        return <FiEdit className="notification-item-icon job-updated" />;
      case 'job_completed':
        return <FiCheckCircle className="notification-item-icon job-completed" />;
      default:
        switch (notification.priority) {
          case 'high':
            return <FiAlertTriangle className="notification-item-icon high-priority" />;
          case 'medium':
            return <FiInfo className="notification-item-icon medium-priority" />;
          default:
            return <FiInfo className="notification-item-icon" />;
        }
    }
  };
  
  return (
    <li className={`notification-item ${!notification.read ? 'unread' : ''}`}>
      <div className="notification-item-leading">
        {getNotificationIcon()}
      </div>
      
      <div 
        className="notification-content"
        onClick={() => markAsRead(notification.id)}
      >
        <div className="notification-item-header">
          <h4 className="notification-item-title">{notification.title}</h4>
          <span className="notification-time">
            {formatRelativeTime(notification.timestamp)}
          </span>
        </div>
        <p className="notification-message">{notification.message}</p>
      </div>
      
      <button 
        className="notification-delete-btn"
        onClick={() => removeNotification(notification.id)}
        aria-label="Delete notification"
      >
        <FiX />
      </button>
    </li>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    priority: PropTypes.string,
    type: PropTypes.string,
    icon: PropTypes.node
  }).isRequired
};

export default NotificationItem; 