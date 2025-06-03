import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiX, FiClock, FiAnchor, FiSettings, FiUser, FiCalendar, FiFlag, FiActivity } from 'react-icons/fi';

const JobDetailModal = ({ job, onClose }) => {
  // Get the original job data
  const originalJob = job.job;
  
  // Format priority class
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'critical':
        return 'priority-critical';
      default:
        return 'priority-medium';
    }
  };
  
  // Format status class
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'status-pending';
      case 'assigned':
        return 'status-assigned';
      case 'in-progress':
        return 'status-progress';
      case 'on-hold':
        return 'status-hold';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };
  
  return (
    <div className="day-detail-modal">
      <div className="modal-header">
        <h3>Job Details</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
      </div>
      
      <div className="modal-content">
        {/* Job Header */}
        <div className="job-modal-header">
          <h2 className="job-modal-title">{job.title}</h2>
          <div className="job-modal-meta">
            <span className={`job-number ${getJobTypeClass(job.jobType)}`}>
              {job.jobNumber}
            </span>
            <span className={`priority-badge ${getPriorityClass(job.priority)}`}>
              {job.priority}
            </span>
            <span className={`status-badge ${getStatusClass(job.status)}`}>
              {job.status}
            </span>
          </div>
        </div>
        
        {/* Job Stats */}
        <div className="job-modal-stats">
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-label">
                <FiAnchor size={16} className="mr-2" />
                Ship
              </div>
              <div className="stat-value">{job.shipName}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <FiSettings size={16} className="mr-2" />
                Component
              </div>
              <div className="stat-value">{job.componentName}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <FiUser size={16} className="mr-2" />
                Engineer
              </div>
              <div className="stat-value">{job.engineerName}</div>
            </div>
          </div>
          
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-label">
                <FiCalendar size={16} className="mr-2" />
                Scheduled
              </div>
              <div className="stat-value">
                {format(job.start, 'MMM d, yyyy')}
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <FiClock size={16} className="mr-2" />
                Time
              </div>
              <div className="stat-value">
                {format(job.start, 'HH:mm')} - {format(job.end, 'HH:mm')}
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">
                <FiFlag size={16} className="mr-2" />
                Due Date
              </div>
              <div className="stat-value">
                {format(job.end, 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Progress */}
        <div className="job-modal-progress">
          <div className="progress-header">
            <h4>
              <FiActivity size={16} className="mr-2" />
              Progress
            </h4>
            <span className="progress-percent">
              {originalJob.progressPercentage || 0}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${originalJob.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Job Description */}
        {originalJob.description && (
          <div className="job-modal-description">
            <h4>Description</h4>
            <p>{originalJob.description}</p>
          </div>
        )}
        
        {/* Notes */}
        {originalJob.notes && originalJob.notes.length > 0 && (
          <div className="job-modal-notes">
            <h4>Notes</h4>
            <div className="notes-list">
              {originalJob.notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-header">
                    <span className="note-author">{note.author}</span>
                    <span className="note-date">
                      {format(new Date(note.date), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="note-text">{note.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="job-modal-actions">
          <Link 
            to={`/jobs/${originalJob.id}`} 
            className="btn-primary"
          >
            View Full Details
          </Link>
          <Link 
            to={`/jobs/${originalJob.id}/edit`} 
            className="btn-secondary"
          >
            Edit Job
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper function to get job type class
const getJobTypeClass = (jobType) => {
  switch(jobType) {
    case 'routine':
      return 'job-routine';
    case 'repair':
      return 'job-repair';
    case 'inspection':
      return 'job-inspection';
    case 'emergency':
      return 'job-emergency';
    case 'overhaul':
      return 'job-overhaul';
    default:
      return 'job-routine';
  }
};

JobDetailModal.propTypes = {
  job: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default JobDetailModal; 