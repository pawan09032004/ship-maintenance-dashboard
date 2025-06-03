import { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { FiPlusCircle, FiEdit, FiCheckCircle, FiRefreshCw, FiTrash } from 'react-icons/fi';

const NotificationDemo = () => {
  const { addNotification } = useNotifications();
  const [jobId, setJobId] = useState(1001);
  
  // Generate a new job ID
  const getNextJobId = () => {
    const nextId = jobId;
    setJobId(prevId => prevId + 1);
    return nextId;
  };
  
  // Sample ship names for demo
  const ships = ['Maersk Explorer', 'Nordic Voyager', 'Pacific Star', 'Atlantic Wave', 'Ocean Guardian'];
  
  // Get a random ship name
  const getRandomShip = () => {
    return ships[Math.floor(Math.random() * ships.length)];
  };
  
  // Sample job names for demo
  const jobTypes = ['Engine Maintenance', 'Hull Inspection', 'Propeller Repair', 'Navigation System Update', 'Electrical System Check'];
  
  // Get a random job name
  const getRandomJobType = () => {
    return jobTypes[Math.floor(Math.random() * jobTypes.length)];
  };
  
  // Demo function to add a job created notification
  const demoJobCreated = () => {
    const id = getNextJobId();
    const jobName = getRandomJobType();
    const shipName = getRandomShip();
    
    addNotification({
      title: 'Job Created',
      message: `New maintenance job #${id} (${jobName}) created for ${shipName}`,
      priority: 'medium',
      icon: <FiPlusCircle />,
      type: 'job_created'
    });
  };
  
  // Demo function to add a job updated notification
  const demoJobUpdated = () => {
    // Use an existing job ID to simulate updates to the same job
    const id = jobId - 1 > 1000 ? jobId - 1 : 1001;
    const jobName = getRandomJobType();
    const updateTypes = ['status', 'schedule', 'assigned technician', 'priority'];
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    addNotification({
      title: 'Job Updated',
      message: `Maintenance job #${id} (${jobName}) ${updateType} updated`,
      priority: 'low',
      icon: <FiEdit />,
      type: 'job_updated'
    });
  };
  
  // Demo function to add a job completed notification
  const demoJobCompleted = () => {
    // Use an existing job ID to simulate completion of an existing job
    const id = jobId - 2 > 1000 ? jobId - 2 : 1001;
    const jobName = getRandomJobType();
    const shipName = getRandomShip();
    
    addNotification({
      title: 'Job Completed',
      message: `Maintenance job #${id} (${jobName}) for ${shipName} has been completed`,
      priority: 'high',
      icon: <FiCheckCircle />,
      type: 'job_completed'
    });
  };
  
  // Demo function to add a job scheduled notification
  const demoJobScheduled = () => {
    const id = getNextJobId();
    const jobName = getRandomJobType();
    const shipName = getRandomShip();
    const daysAhead = Math.floor(Math.random() * 14) + 1;
    
    addNotification({
      title: 'Job Scheduled',
      message: `Maintenance job #${id} (${jobName}) for ${shipName} scheduled in ${daysAhead} days`,
      priority: 'medium',
      icon: <FiRefreshCw />,
      type: 'job_scheduled'
    });
  };
  
  // Demo function to add a job canceled notification
  const demoJobCanceled = () => {
    const id = jobId - 1 > 1000 ? jobId - 1 : 1001;
    const jobName = getRandomJobType();
    
    addNotification({
      title: 'Job Canceled',
      message: `Maintenance job #${id} (${jobName}) has been canceled`,
      priority: 'low',
      icon: <FiTrash />,
      type: 'job_canceled'
    });
  };

  return (
    <div className="notification-demo">
      <h2 className="text-lg font-semibold mb-4">Notification Demo</h2>
      <p className="text-sm text-gray-600 mb-4">Click the buttons below to trigger different notification types</p>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={demoJobCreated}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm flex items-center gap-1.5"
        >
          <FiPlusCircle size={14} /> 
          Create Job
        </button>
        
        <button 
          onClick={demoJobUpdated}
          className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm flex items-center gap-1.5"
        >
          <FiEdit size={14} /> 
          Update Job
        </button>
        
        <button 
          onClick={demoJobCompleted}
          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm flex items-center gap-1.5"
        >
          <FiCheckCircle size={14} /> 
          Complete Job
        </button>
        
        <button 
          onClick={demoJobScheduled}
          className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm flex items-center gap-1.5"
        >
          <FiRefreshCw size={14} /> 
          Schedule Job
        </button>
        
        <button 
          onClick={demoJobCanceled}
          className="px-3 py-1.5 bg-red-500 text-white rounded text-sm flex items-center gap-1.5"
        >
          <FiTrash size={14} /> 
          Cancel Job
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        This component is for demonstration purposes only. In a real application, these notifications 
        would be triggered by actual job-related events.
      </p>
    </div>
  );
};

export default NotificationDemo; 