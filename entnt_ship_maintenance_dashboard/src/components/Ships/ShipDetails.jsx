import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { 
  FiEdit2, 
  FiTrash2, 
  FiArrowLeft, 
  FiCalendar, 
  FiSettings, 
  FiAnchor, 
  FiInfo, 
  FiList, 
  FiClock,
  FiDownload,
  FiFileText,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiTool,
  FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import './ShipsStyles.css';

// Flag emoji mapping
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .substring(0, 2)
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Status badge mapping
const getStatusBadgeClass = (status) => {
  switch(status?.toLowerCase()) {
    case 'active':
      return 'ship-status-active';
    case 'maintenance':
    case 'under maintenance':
      return 'ship-status-maintenance';
    case 'inactive':
    case 'decommissioned':
      return 'ship-status-inactive';
    default:
      return 'ship-status-active';
  }
};

// Component status badge mapping
const getComponentStatusBadgeClass = (status) => {
  switch(status?.toLowerCase()) {
    case 'operational':
      return 'ship-status-active';
    case 'needs_maintenance':
    case 'needs maintenance':
      return 'ship-status-maintenance';
    case 'failed':
    case 'non-operational':
      return 'ship-status-inactive';
    default:
      return 'ship-status-active';
  }
};

// Mock maintenance history data
const generateMaintenanceHistory = (shipId) => {
  const currentDate = new Date();
  const history = [];
  
  // Generate 5 random maintenance records
  for (let i = 0; i < 5; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i * 2 - Math.floor(Math.random() * 2));
    
    const types = ['Routine Inspection', 'Emergency Repair', 'Scheduled Maintenance', 'Component Replacement', 'System Upgrade'];
    const statuses = ['Completed', 'Pending', 'In Progress'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    
    history.push({
      id: `maint_${shipId}_${i}`,
      date: date.toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
      description: `Maintenance activity ${i + 1} for ship ${shipId}`,
      status: i === 0 ? 'Pending' : statuses[Math.floor(Math.random() * (statuses.length - 1))],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      cost: Math.floor(Math.random() * 10000) + 500,
      technician: `Tech ${Math.floor(Math.random() * 5) + 1}`
    });
  }
  
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const ShipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ships, deleteShip } = useShips();
  const { components } = useComponents();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate mock maintenance history
  const maintenanceHistory = generateMaintenanceHistory(id);
  
  const ship = ships.find(s => s.id === id);
  const shipComponents = components.filter(c => c.shipId === id);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteShip(id);
      toast.success('Ship deleted successfully');
      navigate('/ships');
    } catch (error) {
      toast.error('Failed to delete ship');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };
  
  const getPriorityBadgeClass = (priority) => {
    switch(priority?.toLowerCase()) {
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
  
  const getMaintenanceStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'ship-status-active';
      case 'in progress':
        return 'ship-status-maintenance';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };
  
  const getMaintenanceStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <FiCheck />;
      case 'in progress':
        return <FiTool />;
      case 'pending':
        return <FiClock />;
      default:
        return <FiClock />;
    }
  };

  if (!ship) {
    return (
      <div className="ship-detail-container">
        <div className="maritime-card">
          <div className="maritime-card-body text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Ship not found</h2>
            <Link to="/ships" className="maritime-btn maritime-btn-primary">
              <FiArrowLeft className="mr-2" />
              Back to Ships
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ship-detail-container">
      {/* Hero Section */}
      <div className="ship-detail-header">
        <div className="ship-detail-title-row">
          <h1 className="ship-detail-title">{ship.name}</h1>
          <div className="ship-detail-actions">
            <Link to="/ships" className="maritime-btn maritime-btn-secondary">
              <FiArrowLeft className="mr-2" />
              Back
            </Link>
            <Link to={`/ships/${id}/edit`} className="maritime-btn maritime-btn-primary">
              <FiEdit2 className="mr-2" />
              Edit Ship
            </Link>
            <button 
              className="maritime-btn maritime-btn-danger"
              onClick={handleDeleteClick}
              disabled={isLoading}
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <span className={`ship-status-badge ${getStatusBadgeClass(ship.status)} mr-3`}>
            {ship.status}
          </span>
          <span className="text-sm text-gray-500">
            {ship.type} • IMO: {ship.imo || 'N/A'} • Flag: {ship.flag && (
              <span className="inline-flex items-center">
                <span className="mr-1">{getFlagEmoji(ship.flag)}</span>
                {ship.flag}
              </span>
            )}
          </span>
        </div>

        <div className="ship-detail-meta">
          <div className="ship-detail-meta-item">
            <span className="ship-detail-meta-label">Last Maintenance</span>
            <span className="ship-detail-meta-value flex items-center">
              <FiCalendar className="mr-1" size={14} />
              {ship.lastMaintenance ? new Date(ship.lastMaintenance).toLocaleDateString() : 'Not available'}
            </span>
          </div>
          <div className="ship-detail-meta-item">
            <span className="ship-detail-meta-label">Components</span>
            <span className="ship-detail-meta-value flex items-center">
              <FiSettings className="mr-1" size={14} />
              {shipComponents.length}
            </span>
          </div>
          <div className="ship-detail-meta-item">
            <span className="ship-detail-meta-label">Year Built</span>
            <span className="ship-detail-meta-value flex items-center">
              <FiAnchor className="mr-1" size={14} />
              {ship.yearBuilt || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="ship-detail-tabs">
        <div 
          className={`ship-detail-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FiInfo className="mr-2" />
          General Info
        </div>
        <div 
          className={`ship-detail-tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <FiSettings className="mr-2" />
          Components ({shipComponents.length})
        </div>
        <div 
          className={`ship-detail-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <FiClock className="mr-2" />
          Maintenance History
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="maritime-card">
          <div className="maritime-card-header">
            <h3 className="maritime-card-title">Ship Information</h3>
          </div>
          <div className="maritime-card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                <p className="text-base">{ship.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                <p className="text-base">{ship.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <p>
                  <span className={`ship-status-badge ${getStatusBadgeClass(ship.status)}`}>
                    {ship.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">IMO Number</p>
                <p className="text-base font-mono">{ship.imo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Flag</p>
                <p className="text-base flex items-center">
                  {ship.flag && <span className="mr-2">{getFlagEmoji(ship.flag)}</span>}
                  {ship.flag || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Last Maintenance</p>
                <p className="text-base">{ship.lastMaintenance ? new Date(ship.lastMaintenance).toLocaleDateString() : 'Not available'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p className="text-base">{ship.description || 'No description available'}</p>
              </div>
            </div>
            
            {(ship.dimensions || ship.capacity) && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Technical Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ship.dimensions && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Length</p>
                        <p className="text-base">{ship.dimensions.length ? `${ship.dimensions.length} m` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Width</p>
                        <p className="text-base">{ship.dimensions.width ? `${ship.dimensions.width} m` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
                        <p className="text-base">{ship.dimensions.draft ? `${ship.dimensions.draft} m` : 'N/A'}</p>
                      </div>
                    </>
                  )}
                  
                  {ship.capacity && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Deadweight</p>
                        <p className="text-base">{ship.capacity.deadweight ? `${ship.capacity.deadweight} tons` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Gross Tonnage</p>
                        <p className="text-base">{ship.capacity.grossTonnage ? `${ship.capacity.grossTonnage}` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Net Tonnage</p>
                        <p className="text-base">{ship.capacity.netTonnage ? `${ship.capacity.netTonnage}` : 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {ship.contactDetails && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Owner/Company</p>
                    <p className="text-base">{ship.contactDetails.owner || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-base">{ship.contactDetails.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                    <p className="text-base">{ship.contactDetails.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {ship.image && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Ship Image</h4>
                <div className="ship-detail-image">
                  <img src={ship.image} alt={ship.name} />
                </div>
              </div>
            )}
            
            {ship.documents && ship.documents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Documents</h4>
                <div className="ship-detail-documents">
                  {ship.documents.map((doc, index) => (
                    <div key={index} className="ship-detail-document">
                      <div className="ship-detail-document-icon">
                        <FiFileText size={24} />
                      </div>
                      <div className="ship-detail-document-info">
                        <p className="ship-detail-document-name">{doc.name}</p>
                        <p className="ship-detail-document-meta">
                          {(doc.size / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="ship-detail-document-download">
                        <FiDownload size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Ship Components</h3>
            <Link to={`/components/new?shipId=${id}`} className="maritime-btn maritime-btn-primary">
              <FiPlus className="mr-2" />
              Add Component
            </Link>
          </div>

          {shipComponents.length > 0 ? (
            <div className="ship-components-grid">
              {shipComponents.map(component => (
                <div key={component.id} className="ship-component-card">
                  <div className="ship-component-header">
                    <div>
                      <h4 className="ship-component-title">{component.name}</h4>
                      <p className="ship-component-type">{component.type}</p>
                    </div>
                    <div className="ship-component-status">
                      <span className={`ship-status-badge ${getComponentStatusBadgeClass(component.status)}`}>
                        {component.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{component.description || 'No description'}</p>
                    <div className="flex justify-between items-center">
                      <span className="ship-component-date">
                        <FiCalendar className="inline mr-1" size={12} />
                        Last maintenance: {new Date(component.lastMaintenanceDate).toLocaleDateString()}
                      </span>
                      <Link to={`/components/${component.id}`} className="text-xs text-cyan-600 hover:text-cyan-800">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ship-empty-state">
              <FiSettings size={48} className="text-gray-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">No Components Added</h4>
              <p className="text-gray-500 mb-4">This ship doesn't have any components yet.</p>
              <Link to={`/components/new?shipId=${id}`} className="maritime-btn maritime-btn-primary">
                Add First Component
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="maritime-card">
          <div className="maritime-card-header">
            <div className="flex justify-between items-center">
              <h3 className="maritime-card-title">Maintenance History</h3>
              <button className="maritime-btn maritime-btn-secondary">
                <FiDownload className="mr-2" />
                Export History
              </button>
            </div>
          </div>
          <div className="maritime-card-body p-0">
            <div className="ship-maintenance-table-container">
              <table className="ship-maintenance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.type}</td>
                      <td>{record.description}</td>
                      <td>
                        <span className={`priority-badge ${getPriorityBadgeClass(record.priority)}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`maintenance-status-badge ${getMaintenanceStatusBadgeClass(record.status)}`}>
                          <span className="maintenance-status-icon">{getMaintenanceStatusIcon(record.status)}</span>
                          {record.status}
                        </span>
                      </td>
                      <td>${record.cost.toLocaleString()}</td>
                      <td>{record.technician}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <div className="modal-warning-icon">
                <FiAlertTriangle size={48} />
              </div>
              <p>Are you sure you want to delete the ship "{ship.name}"?</p>
              <p className="modal-warning">This action cannot be undone and will remove all associated data.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="maritime-btn maritime-btn-secondary"
                onClick={cancelDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="maritime-btn maritime-btn-danger"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Ship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipDetails; 