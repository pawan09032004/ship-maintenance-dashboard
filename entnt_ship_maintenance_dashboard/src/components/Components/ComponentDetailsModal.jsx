import { useState } from 'react';
import { useComponents } from '../../contexts/ComponentsContext';
import { useShips } from '../../contexts/ShipsContext';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { 
  FiX, FiEdit2, FiTrash2, FiCalendar, FiClock, FiTool, 
  FiAlertTriangle, FiActivity, FiAnchor, FiBarChart2
} from 'react-icons/fi';
import './ComponentsStyles.css';

const ComponentDetailsModal = ({ isOpen, onClose, componentId, onEdit, onDelete }) => {
  const { getComponentById } = useComponents();
  const { getShipById } = useShips();
  const [activeTab, setActiveTab] = useState('details');
  
  const component = componentId ? getComponentById(componentId) : null;
  const ship = component ? getShipById(component.shipId) : null;
  
  if (!isOpen || !component || !ship) return null;

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'operational':
        return 'status-active';
      case 'needs_maintenance':
      case 'needs maintenance':
        return 'status-maintenance';
      case 'critical':
      case 'failed':
      case 'non-operational':
        return 'status-critical';
      default:
        return 'status-active';
    }
  };

  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'operational':
        return 'Active';
      case 'needs_maintenance':
      case 'needs maintenance':
        return 'Maintenance Due';
      case 'critical':
      case 'failed':
      case 'non-operational':
        return 'Critical';
      default:
        return 'Active';
    }
  };

  const getHealthScoreClass = (score) => {
    if (score >= 80) return 'health-fill-good';
    if (score >= 50) return 'health-fill-fair';
    return 'health-fill-poor';
  };

  const generateMaintenanceTimeline = () => {
    const timeline = [];
    
    // Add installation date
    if (component.installationDate) {
      timeline.push({
        id: 'installation',
        date: new Date(component.installationDate),
        type: 'installation',
        title: 'Installation',
        description: 'Component installed on ship'
      });
    }
    
    // Add maintenance history events
    if (component.maintenanceHistory && component.maintenanceHistory.length > 0) {
      component.maintenanceHistory.forEach((event, index) => {
        timeline.push({
          id: `maintenance_${index}`,
          date: new Date(event.date),
          type: 'maintenance',
          title: event.title || 'Maintenance Performed',
          description: event.description || 'Regular maintenance'
        });
      });
    }
    
    // Add next scheduled maintenance if available
    if (component.nextMaintenanceDate) {
      const nextDate = new Date(component.nextMaintenanceDate);
      const today = new Date();
      const status = isBefore(nextDate, today) ? 'overdue' : 'upcoming';
      
      timeline.push({
        id: 'next_maintenance',
        date: nextDate,
        type: 'scheduled',
        title: 'Scheduled Maintenance',
        description: 'Regular maintenance scheduled',
        status
      });
    }
    
    // Sort timeline by date
    return timeline.sort((a, b) => a.date - b.date);
  };

  const maintenanceTimeline = generateMaintenanceTimeline();

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">{component.name}</h2>
            <span className={`status-badge ${getStatusClass(component.status)}`}>
              {getStatusDisplay(component.status)}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        
        <div className="component-detail-tabs">
          <button 
            className={`component-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`component-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance History
          </button>
          <button 
            className={`component-tab ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            Health & Performance
          </button>
        </div>
        
        <div className="modal-body">
          {activeTab === 'details' && (
            <div className="component-details-tab">
              <div className="component-info-grid">
                <div className="component-info-item">
                  <div className="component-info-label">Serial Number</div>
                  <div className="component-info-value">{component.serialNumber || 'N/A'}</div>
                </div>
                
                <div className="component-info-item">
                  <div className="component-info-label">Category</div>
                  <div className="component-info-value">{component.category || 'N/A'}</div>
                </div>
                
                <div className="component-info-item">
                  <div className="component-info-label">Ship</div>
                  <div className="component-info-value">{ship.name}</div>
                </div>
                
                <div className="component-info-item">
                  <div className="component-info-label">Installation Date</div>
                  <div className="component-info-value">
                    {component.installationDate 
                      ? format(new Date(component.installationDate), 'MMM dd, yyyy')
                      : 'N/A'}
                  </div>
                </div>
                
                <div className="component-info-item">
                  <div className="component-info-label">Last Maintenance</div>
                  <div className="component-info-value">
                    {component.lastMaintenanceDate 
                      ? format(new Date(component.lastMaintenanceDate), 'MMM dd, yyyy')
                      : 'Never'}
                  </div>
                </div>
                
                <div className="component-info-item">
                  <div className="component-info-label">Health Status</div>
                  <div className="component-info-value">
                    <div className="health-meter">
                      <div className="health-bar">
                        <div 
                          className={`health-fill ${getHealthScoreClass(component.healthScore)}`}
                          style={{ width: `${component.healthScore}%` }}
                        ></div>
                      </div>
                      <div className="health-score">{component.healthScore}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {component.notes && (
                <div className="component-notes">
                  <h3>Notes</h3>
                  <p>{component.notes}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'maintenance' && (
            <div className="component-maintenance-tab">
              <div className="maintenance-timeline">
                {maintenanceTimeline.length > 0 ? (
                  maintenanceTimeline.map((event) => (
                    <div 
                      key={event.id} 
                      className={`maintenance-event ${event.type} ${event.status || ''}`}
                    >
                      <div className="maintenance-date">
                        {format(event.date, 'MMM dd, yyyy')}
                        <span className={`maintenance-tag ${event.status || ''}`}>
                          {event.type === 'installation' && 'Installation'}
                          {event.type === 'maintenance' && 'Maintenance'}
                          {event.type === 'scheduled' && (
                            event.status === 'overdue' ? 'Overdue' : 'Scheduled'
                          )}
                        </span>
                      </div>
                      <div className="maintenance-content">
                        <h4 className="maintenance-title">{event.title}</h4>
                        <p className="maintenance-description">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="maintenance-empty">
                    <FiCalendar className="maintenance-empty-icon" size={48} />
                    <p>No maintenance history available</p>
                  </div>
                )}
              </div>
              
              <div className="maintenance-schedule-card">
                <h3 className="maintenance-schedule-title">
                  <FiClock size={18} className="mr-2" />
                  Next Scheduled Maintenance
                </h3>
                <div className="maintenance-schedule-info">
                  {component.nextMaintenanceDate ? (
                    <>
                      <p className="schedule-date">
                        {format(new Date(component.nextMaintenanceDate), 'MMMM dd, yyyy')}
                      </p>
                      {isAfter(new Date(), new Date(component.nextMaintenanceDate)) && (
                        <p className="schedule-overdue">
                          <FiAlertTriangle size={16} className="mr-2" />
                          Maintenance is overdue by {formatDistanceToNow(new Date(component.nextMaintenanceDate))}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>No maintenance scheduled</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'health' && (
            <div className="component-health-tab">
              <div className="health-summary">
                <div className="health-score-large">
                  <div className="health-score-circle">
                    <div 
                      className={`health-score-circle-fill ${getHealthScoreClass(component.healthScore)}`}
                      style={{ width: `${component.healthScore}%` }}
                    >
                      <span>{component.healthScore}%</span>
                    </div>
                  </div>
                  <h3 className="health-score-title">Health Score</h3>
                </div>
                
                <div className="health-details">
                  <p>
                    This component is {component.healthScore >= 80 ? 'in good condition' : 
                      (component.healthScore >= 50 ? 'in fair condition' : 'in poor condition')}
                    {component.lastMaintenanceDate && `. Last maintained ${
                      formatDistanceToNow(new Date(component.lastMaintenanceDate))
                    } ago.`}
                  </p>
                  
                  {component.healthScore < 80 && (
                    <div className="health-recommendation">
                      <FiAlertTriangle size={18} className="mr-2" />
                      {component.healthScore < 50 
                        ? 'This component requires immediate maintenance attention.'
                        : 'This component should be inspected during the next maintenance cycle.'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="health-trends">
                <h3>Health Trends</h3>
                <div className="health-trends-placeholder">
                  <FiBarChart2 size={48} />
                  <p>Health trend data will be displayed here in future updates.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <div className="modal-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                onEdit(componentId);
                onClose();
              }}
            >
              <FiEdit2 size={16} className="mr-2" />
              Edit
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => {
                onDelete(componentId);
                onClose();
              }}
            >
              <FiTrash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsModal; 