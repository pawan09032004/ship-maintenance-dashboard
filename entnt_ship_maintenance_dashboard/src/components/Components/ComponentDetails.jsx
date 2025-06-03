import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComponents } from '../../contexts/ComponentsContext';
import { useShips } from '../../contexts/ShipsContext';
import { format, formatDistanceToNow, addDays, isAfter, isBefore } from 'date-fns';
import { 
  FiEdit2, FiTrash2, FiArrowLeft, FiCalendar, FiClock, FiSettings,
  FiTool, FiAlertTriangle, FiCheckCircle, FiClipboard, FiInfo,
  FiImage, FiFileText, FiDownload, FiPlusCircle, FiX, FiAnchor,
  FiBarChart2, FiPackage, FiActivity, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ComponentsStyles.css';

const ComponentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComponentById, updateComponent, deleteComponent, updateLastMaintenanceDate } = useComponents();
  const { getShipById } = useShips();
  const [activeTab, setActiveTab] = useState('general');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const component = getComponentById(id);
  const ship = component ? getShipById(component.shipId) : null;

  if (!component || !ship) {
    return (
      <div className="component-not-found">
        <FiAlertTriangle size={48} className="not-found-icon" />
        <h1>Component Not Found</h1>
        <p>The component you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/components')}
          className="btn btn-primary"
        >
          Back to Components
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteComponent(id);
    toast.success('Component deleted successfully');
    navigate('/components');
  };

  const handlePerformMaintenance = () => {
    const today = new Date().toISOString().split('T')[0];
    updateLastMaintenanceDate(id, today);
    toast.success('Maintenance recorded successfully');
  };

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

  const getHealthScoreText = (score) => {
    if (score >= 80) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  // Generate QR code data URL for component tracking
  const generateQRCodeURL = () => {
    // This would typically call a QR code generation service or library
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      `component:${component.id}:${component.serialNumber}`
    )}`;
  };

  // Create a maintenance timeline including past events and future scheduled maintenance
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
  const qrCodeURL = generateQRCodeURL();

  return (
    <div className="component-detail-container">
      {/* Header with basic info and actions */}
      <div className={`component-detail-header ${getStatusClass(component.status)}`}>
        <div className="component-detail-title-row">
          <div className="component-detail-breadcrumb">
            <Link to="/components" className="breadcrumb-link">
              <FiArrowLeft size={16} className="mr-2" />
              Components
            </Link>
            <span className="breadcrumb-separator">/</span>
            <Link to={`/ships/${ship.id}`} className="breadcrumb-link">
              {ship.name}
            </Link>
          </div>
          <div className="component-detail-actions">
            <button 
              onClick={handlePerformMaintenance}
              className="btn btn-secondary"
            >
              <FiTool size={16} className="mr-2" />
              Mark Maintained
            </button>
            <button 
              onClick={() => navigate(`/components/${id}/edit`)}
              className="btn btn-secondary"
            >
              <FiEdit2 size={16} className="mr-2" />
              Edit
            </button>
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="btn btn-danger"
            >
              <FiTrash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>
        
        <h1 className="component-detail-title">{component.name}</h1>
        
        <div className="component-detail-meta">
          <div className="component-detail-meta-item">
            <span className="component-detail-meta-label">Serial Number</span>
            <span className="component-detail-meta-value">{component.serialNumber}</span>
          </div>
          <div className="component-detail-meta-item">
            <span className="component-detail-meta-label">Category</span>
            <span className="component-detail-meta-value">{component.category || 'Uncategorized'}</span>
          </div>
          <div className="component-detail-meta-item">
            <span className="component-detail-meta-label">Status</span>
            <span className={`status-badge ${getStatusClass(component.status)}`}>
              {getStatusDisplay(component.status)}
            </span>
          </div>
          <div className="component-detail-meta-item">
            <span className="component-detail-meta-label">Health</span>
            <div className="health-meter">
              <div className="health-bar">
                <div 
                  className={`health-fill ${getHealthScoreClass(component.healthScore)}`}
                  style={{ width: `${component.healthScore || 0}%` }}
                ></div>
              </div>
              <div className="health-score">
                <span>{getHealthScoreText(component.healthScore)}</span>
                <span>{component.healthScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with tabs */}
      <div className="component-detail-content">
        <div className="component-detail-tabs">
          <button 
            className={`component-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FiInfo size={16} className="mr-2" />
            General Information
          </button>
          <button 
            className={`component-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <FiTool size={16} className="mr-2" />
            Maintenance History
          </button>
          <button 
            className={`component-tab ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            <FiClipboard size={16} className="mr-2" />
            Specifications
          </button>
          <button 
            className={`component-tab ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <FiImage size={16} className="mr-2" />
            Images & Documents
          </button>
        </div>
        
        {/* Tab content */}
        <div className="component-detail-tab-content">
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <div className="component-general-info">
              <div className="component-info-grid">
                <div className="component-info-card">
                  <h3 className="component-info-card-title">
                    <FiSettings size={18} className="mr-2" />
                    Basic Details
                  </h3>
                  <div className="component-info-list">
                    <div className="component-info-item">
                      <span className="component-info-label">Manufacturer</span>
                      <span className="component-info-value">{component.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Model</span>
                      <span className="component-info-value">{component.model || 'N/A'}</span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Serial Number</span>
                      <span className="component-info-value">{component.serialNumber}</span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Category</span>
                      <span className="component-info-value">{component.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="component-info-card">
                  <h3 className="component-info-card-title">
                    <FiAnchor size={18} className="mr-2" />
                    Ship Information
                  </h3>
                  <div className="component-info-list">
                    <div className="component-info-item">
                      <span className="component-info-label">Ship Name</span>
                      <span className="component-info-value">{ship.name}</span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">IMO Number</span>
                      <span className="component-info-value">{ship.imoNumber || 'N/A'}</span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Ship Type</span>
                      <span className="component-info-value">{ship.type || 'N/A'}</span>
                    </div>
                    <div className="component-info-item">
                      <Link to={`/ships/${ship.id}`} className="btn btn-sm btn-outline">
                        View Ship Details
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="component-info-card">
                  <h3 className="component-info-card-title">
                    <FiCalendar size={18} className="mr-2" />
                    Installation & Maintenance
                  </h3>
                  <div className="component-info-list">
                    <div className="component-info-item">
                      <span className="component-info-label">Installation Date</span>
                      <span className="component-info-value">
                        {component.installationDate ? 
                          format(new Date(component.installationDate), 'MMM d, yyyy') : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Last Maintenance</span>
                      <span className="component-info-value">
                        {component.lastMaintenanceDate ? 
                          format(new Date(component.lastMaintenanceDate), 'MMM d, yyyy') : 
                          'Never'
                        }
                      </span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Next Maintenance</span>
                      <span className="component-info-value">
                        {component.nextMaintenanceDate ? 
                          format(new Date(component.nextMaintenanceDate), 'MMM d, yyyy') : 
                          'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="component-info-item">
                      <button 
                        onClick={handlePerformMaintenance}
                        className="btn btn-sm btn-primary"
                      >
                        <FiTool size={14} className="mr-1" />
                        Record Maintenance
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="component-info-card">
                  <h3 className="component-info-card-title">
                    <FiBarChart2 size={18} className="mr-2" />
                    Health & Status
                  </h3>
                  <div className="component-info-list">
                    <div className="component-info-item">
                      <span className="component-info-label">Current Status</span>
                      <span className={`status-badge ${getStatusClass(component.status)}`}>
                        {getStatusDisplay(component.status)}
                      </span>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Health Score</span>
                      <div className="health-meter">
                        <div 
                          className={`health-fill ${getHealthScoreClass(component.healthScore)}`}
                          style={{ width: `${component.healthScore || 0}%` }}
                        ></div>
                      </div>
                      <div className="health-score">
                        <span>{getHealthScoreText(component.healthScore)}</span>
                        <span>{component.healthScore || 0}%</span>
                      </div>
                    </div>
                    <div className="component-info-item">
                      <span className="component-info-label">Maintenance Interval</span>
                      <span className="component-info-value">90 days</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="component-description-card">
                <h3 className="component-info-card-title">
                  <FiFileText size={18} className="mr-2" />
                  Description
                </h3>
                <p className="component-description">
                  {component.description || 'No description available for this component.'}
                </p>
              </div>
              
              {/* QR Code */}
              <div className="component-qr-card">
                <h3 className="component-info-card-title">
                  <FiPackage size={18} className="mr-2" />
                  Component Tracking
                </h3>
                <div className="component-qr-container">
                  <div className="component-qr-code">
                    <img src={qrCodeURL} alt="Component QR Code" />
                  </div>
                  <div className="component-qr-info">
                    <p>Scan this QR code to quickly access component details from mobile devices.</p>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => window.open(qrCodeURL, '_blank')}
                    >
                      <FiDownload size={14} className="mr-1" />
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Maintenance History Tab */}
          {activeTab === 'maintenance' && (
            <div className="component-maintenance-info">
              <div className="maintenance-header">
                <h3 className="maintenance-title">
                  <FiActivity size={18} className="mr-2" />
                  Maintenance Timeline
                </h3>
                <button 
                  onClick={handlePerformMaintenance} 
                  className="btn btn-primary"
                >
                  <FiRefreshCw size={16} className="mr-2" />
                  Record New Maintenance
                </button>
              </div>
              
              {maintenanceTimeline.length > 0 ? (
                <div className="maintenance-timeline">
                  {maintenanceTimeline.map(event => (
                    <div 
                      key={event.id} 
                      className={`maintenance-event ${event.status || ''} ${event.type}`}
                    >
                      <div className="maintenance-date">
                        {format(event.date, 'MMM d, yyyy')}
                        {event.status === 'upcoming' && (
                          <span className="maintenance-tag upcoming">Upcoming</span>
                        )}
                        {event.status === 'overdue' && (
                          <span className="maintenance-tag overdue">Overdue</span>
                        )}
                      </div>
                      <h4 className="maintenance-title">{event.title}</h4>
                      <p className="maintenance-description">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="maintenance-empty">
                  <FiCalendar size={32} className="maintenance-empty-icon" />
                  <p>No maintenance records found for this component.</p>
                  <button 
                    onClick={handlePerformMaintenance} 
                    className="btn btn-sm btn-primary"
                  >
                    Record First Maintenance
                  </button>
                </div>
              )}
              
              {/* Maintenance Schedule */}
              <div className="maintenance-schedule-card">
                <h3 className="maintenance-schedule-title">
                  <FiClock size={18} className="mr-2" />
                  Maintenance Schedule
                </h3>
                <div className="maintenance-schedule-info">
                  <p>This component is on a regular maintenance schedule of every 90 days.</p>
                  {component.nextMaintenanceDate && (
                    <div className={`alert ${isBefore(new Date(component.nextMaintenanceDate), new Date()) ? 'alert-danger' : 'alert-warning'}`}>
                      <FiAlertTriangle size={16} />
                      <span>
                        Next maintenance {
                          isBefore(new Date(component.nextMaintenanceDate), new Date()) 
                            ? `was due ${formatDistanceToNow(new Date(component.nextMaintenanceDate))} ago` 
                            : `due in ${formatDistanceToNow(new Date(component.nextMaintenanceDate))}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div className="component-specifications-info">
              <div className="specifications-header">
                <h3 className="specifications-title">
                  <FiClipboard size={18} className="mr-2" />
                  Technical Specifications
                </h3>
                <Link 
                  to={`/components/${id}/edit`}
                  className="btn btn-sm btn-outline"
                >
                  <FiEdit2 size={14} className="mr-1" />
                  Edit Specifications
                </Link>
              </div>
              
              {component.specifications && Object.keys(component.specifications).length > 0 ? (
                <div className="specifications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(component.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="specifications-empty">
                  <FiClipboard size={32} className="specifications-empty-icon" />
                  <p>No specifications have been added for this component.</p>
                  <Link 
                    to={`/components/${id}/edit`}
                    className="btn btn-sm btn-primary"
                  >
                    Add Specifications
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Images & Documents Tab */}
          {activeTab === 'media' && (
            <div className="component-media-info">
              <div className="media-section">
                <h3 className="media-section-title">
                  <FiImage size={18} className="mr-2" />
                  Component Images
                </h3>
                
                {component.images && component.images.length > 0 ? (
                  <div className="component-images-grid">
                    {component.images.map((image, index) => (
                      <div key={image.id || index} className="component-image-card">
                        <img src={image.data} alt={`Component ${index + 1}`} />
                        <div className="component-image-overlay">
                          <span>{image.name || `Image ${index + 1}`}</span>
                          <div className="component-image-actions">
                            <button className="image-action-btn" onClick={() => window.open(image.data, '_blank')}>
                              <FiEye size={14} />
                            </button>
                            <a href={image.data} download={image.name || `component_${component.id}_image_${index + 1}`} className="image-action-btn">
                              <FiDownload size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="media-empty">
                    <FiImage size={32} className="media-empty-icon" />
                    <p>No images have been added for this component.</p>
                    <Link 
                      to={`/components/${id}/edit`}
                      className="btn btn-sm btn-primary"
                    >
                      Add Images
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="media-section">
                <h3 className="media-section-title">
                  <FiFileText size={18} className="mr-2" />
                  Related Documents
                </h3>
                
                {component.documents && component.documents.length > 0 ? (
                  <div className="component-documents-list">
                    {component.documents.map((doc, index) => (
                      <div key={doc.id || index} className="component-document-card">
                        <div className="document-icon">
                          <FiFileText size={24} />
                        </div>
                        <div className="document-info">
                          <h4 className="document-name">{doc.name || `Document ${index + 1}`}</h4>
                          <p className="document-meta">
                            {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM d, yyyy') : 'No date'}
                          </p>
                        </div>
                        <div className="document-actions">
                          <a href={doc.data} download={doc.name} className="document-action-btn">
                            <FiDownload size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="media-empty">
                    <FiFileText size={32} className="media-empty-icon" />
                    <p>No documents have been added for this component.</p>
                    <Link 
                      to={`/components/${id}/edit`}
                      className="btn btn-sm btn-primary"
                    >
                      Add Documents
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deletion</h3>
              <button className="modal-close" onClick={() => setShowConfirmDelete(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <FiAlertTriangle size={48} className="modal-icon warning" />
              <p>Are you sure you want to delete <strong>{component.name}</strong>?</p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Component
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentDetails; 