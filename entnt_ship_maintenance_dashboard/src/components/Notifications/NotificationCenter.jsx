import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { FiCheckCircle, FiEdit, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './NotificationStyles.css';

const NotificationCenter = () => {
  const { addNotification } = useNotifications();
  
  // Demo function to add a job created notification
  const addJobCreatedNotification = (jobId, jobName, shipName) => {
    addNotification({
      title: 'Job Created',
      message: `New maintenance job #${jobId} (${jobName}) created for ${shipName}`,
      priority: 'medium',
      icon: <FiPlusCircle />,
      type: 'job_created'
    });
    
    // Also show a toast notification
    toast.success(`Job #${jobId} created successfully!`, {
      icon: '🚢',
      duration: 4000
    });
  };
  
  // Demo function to add a job updated notification
  const addJobUpdatedNotification = (jobId, jobName, updateType) => {
    addNotification({
      title: 'Job Updated',
      message: `Maintenance job #${jobId} (${jobName}) ${updateType} updated`,
      priority: 'low',
      icon: <FiEdit />,
      type: 'job_updated'
    });
  };
  
  // Demo function to add a job completed notification
  const addJobCompletedNotification = (jobId, jobName, shipName) => {
    addNotification({
      title: 'Job Completed',
      message: `Maintenance job #${jobId} (${jobName}) for ${shipName} has been completed`,
      priority: 'high',
      icon: <FiCheckCircle />,
      type: 'job_completed'
    });
    
    // Also show a toast notification
    toast.success(`Job #${jobId} completed!`, {
      icon: '✅',
      duration: 4000
    });
  };
  
  // Make the notification functions available globally for other components
  useEffect(() => {
    window.shipNotifications = {
      addJobCreatedNotification,
      addJobUpdatedNotification,
      addJobCompletedNotification
    };
    
    return () => {
      delete window.shipNotifications;
    };
  }, []);
  
  return (
    <div className="notification-center">
      {/* This component acts as a wrapper and provides the notification API */}
      <NotificationDropdown />
    </div>
  );
};

export default NotificationCenter; 