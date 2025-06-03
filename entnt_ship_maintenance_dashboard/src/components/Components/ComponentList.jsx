import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComponents } from '../../contexts/ComponentsContext';
import { useShips } from '../../contexts/ShipsContext';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiEye, FiEdit2, FiTrash2, 
  FiPlus, FiAnchor, FiSettings, FiCalendar, FiDownload, 
  FiCheckSquare, FiSquare, FiChevronDown, FiX, FiAlertTriangle,
  FiMoreVertical, FiTool, FiRefreshCw, FiChevronUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ComponentsStyles.css';
import ComponentModal from './ComponentModal';
import ConfirmationModal from './ConfirmationModal';
import ComponentDetailsModal from './ComponentDetailsModal';

// Component status badge mapping
const getComponentStatusBadgeClass = (status) => {
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

// Component status display name
const getStatusDisplayName = (status) => {
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

// Component type icon mapping
const getComponentTypeIcon = (type) => {
  switch(type?.toLowerCase()) {
    case 'engine':
      return <FiSettings className="h-4 w-4" />;
    case 'navigation':
      return <FiGrid className="h-4 w-4" />;
    case 'electrical':
      return <FiList className="h-4 w-4" />;
    case 'hull':
      return <FiAnchor className="h-4 w-4" />;
    default:
      return <FiSettings className="h-4 w-4" />;
  }
};

const getComponentCardClass = (status) => {
  switch(status?.toLowerCase()) {
    case 'needs_maintenance':
    case 'needs maintenance':
      return 'maintenance';
    case 'critical':
    case 'failed':
    case 'non-operational':
      return 'critical';
    default:
      return '';
  }
};

// Health score color class
const getHealthScoreColorClass = (score) => {
  if (score >= 80) return 'health-fill-good';
  if (score >= 50) return 'health-fill-fair';
  return 'health-fill-poor';
};

// CSV Export function
const exportToCSV = (components, ships) => {
  const headers = [
    'Name', 
    'Serial Number', 
    'Ship', 
    'Category', 
    'Status', 
    'Installation Date', 
    'Last Maintenance', 
    'Next Maintenance',
    'Health Score'
  ];
  
  const rows = components.map(component => {
    const ship = ships.find(s => s.id === component.shipId);
    return [
      component.name,
      component.serialNumber || 'N/A',
      ship ? ship.name : 'Unknown',
      component.category || 'N/A',
      component.status || 'N/A',
      component.installationDate ? format(new Date(component.installationDate), 'yyyy-MM-dd') : 'N/A',
      component.lastMaintenanceDate ? format(new Date(component.lastMaintenanceDate), 'yyyy-MM-dd') : 'N/A',
      component.nextMaintenanceDate ? format(new Date(component.nextMaintenanceDate), 'yyyy-MM-dd') : 'N/A',
      component.healthScore || 'N/A'
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `components_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ComponentList = () => {
  const { 
    components, 
    deleteComponent, 
    selectedComponents, 
    toggleComponentSelection, 
    clearComponentSelection, 
    selectAllComponents, 
    bulkDeleteComponents,
    updateLastMaintenanceDate,
    bulkUpdateComponents
  } = useComponents();
  const { ships } = useShips();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const componentsPerPage = 9;
  const [dropdownOpen, setDropdownOpen] = useState(null);
  
  // Responsive states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [filtersVisible, setFiltersVisible] = useState(!isMobile);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      
      // Auto-show filters on larger screens
      if (!mobile && !filtersVisible) {
        setFiltersVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [filtersVisible]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const getShipName = (shipId) => {
    const ship = ships.find(s => s.id === shipId);
    return ship ? ship.name : 'Unknown Ship';
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter components based on search term and filters
  const filteredComponents = components.filter(component => {
    const matchesSearch = 
      (component.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (component.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (component.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      getShipName(component.shipId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                        (component.status?.toLowerCase() === statusFilter.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
                          (component.category?.toLowerCase() === categoryFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort components
  const sortedComponents = [...filteredComponents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'shipId') {
      aValue = getShipName(a.shipId);
      bValue = getShipName(b.shipId);
    }
    
    if (!aValue) return 1;
    if (!bValue) return -1;
    
    if (typeof aValue === 'string') {
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else {
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
  });

  // Pagination
  const indexOfLastComponent = currentPage * componentsPerPage;
  const indexOfFirstComponent = indexOfLastComponent - componentsPerPage;
  const currentComponents = sortedComponents.slice(indexOfFirstComponent, indexOfLastComponent);
  const totalPages = Math.ceil(sortedComponents.length / componentsPerPage);

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedComponents.length === currentComponents.length) {
      clearComponentSelection();
    } else {
      selectAllComponents(currentComponents.map(c => c.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedComponents.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedComponents.length} components?`)) {
      bulkDeleteComponents(selectedComponents);
      toast.success(`${selectedComponents.length} components deleted`);
    }
  };

  // Handle bulk maintenance
  const handleBulkMaintenance = () => {
    if (selectedComponents.length === 0) return;
    
    if (confirm(`Mark ${selectedComponents.length} components as maintained today?`)) {
      const today = new Date().toISOString().split('T')[0];
      bulkUpdateComponents(selectedComponents, {
        lastMaintenanceDate: today,
        status: 'operational',
        healthScore: 100
      });
      toast.success(`${selectedComponents.length} components marked as maintained`);
    }
  };

  // Handle component selection for different actions
  const handleEditClick = (component) => {
    setSelectedComponent(component);
    setShowEditModal(true);
  };
  
  const handleDeleteClick = (component) => {
    setSelectedComponent(component);
    setShowDeleteModal(true);
  };
  
  const handleViewDetailsClick = (component) => {
    setSelectedComponent(component);
    setShowDetailsModal(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedComponent) {
      deleteComponent(selectedComponent.id);
      toast.success(`${selectedComponent.name} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedComponent(null);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(components.map(c => c.category).filter(Boolean))];

  // Toggle dropdown for a specific component
  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Components</h1>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus className="btn-icon" /> Add Component
          </button>
        </div>
      </div>
      
      <div className="page-tools">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="search-clear" 
              onClick={() => setSearchTerm('')}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        
        <div className="view-controls">
          <button
            className={`view-control-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <FiGrid />
          </button>
          <button
            className={`view-control-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <FiList />
          </button>
          <button
            className="view-control-btn"
            onClick={() => exportToCSV(components, ships)}
            title="Export to CSV"
          >
            <FiDownload />
          </button>
        </div>
      </div>
      
      {/* Mobile Filter Toggle Button */}
      {isMobile && (
        <button 
          className="filter-toggle-button" 
          onClick={toggleFilters}
          aria-expanded={filtersVisible}
        >
          <span>
            <FiFilter size={16} style={{ marginRight: '8px' }} /> 
            Filters
          </span>
          <FiChevronDown className={`filter-toggle-icon ${filtersVisible ? 'open' : ''}`} />
        </button>
      )}
      
      {/* Filters Section - Collapsible on Mobile */}
      {filtersVisible && (
        <div className="components-filters">
          <div className="filter-section">
            <div className="filter-label">Status:</div>
            <div className="filter-group">
              <button
                className={`components-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`components-filter-btn status-active ${statusFilter === 'operational' ? 'active' : ''}`}
                onClick={() => setStatusFilter('operational')}
              >
                Active
              </button>
              <button
                className={`components-filter-btn status-maintenance ${statusFilter === 'needs_maintenance' ? 'active' : ''}`}
                onClick={() => setStatusFilter('needs_maintenance')}
              >
                Maintenance Due
              </button>
              <button
                className={`components-filter-btn status-critical ${statusFilter === 'critical' ? 'active' : ''}`}
                onClick={() => setStatusFilter('critical')}
              >
                Critical
              </button>
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-label">Category:</div>
            <div className="filter-group">
              <button
                className={`components-filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              <button
                className={`components-filter-btn ${categoryFilter === 'Machinery' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Machinery')}
              >
                Machinery
              </button>
              <button
                className={`components-filter-btn ${categoryFilter === 'Engine' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Engine')}
              >
                Engine
              </button>
              <button
                className={`components-filter-btn ${categoryFilter === 'Hull' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Hull')}
              >
                Hull
              </button>
              <button
                className={`components-filter-btn ${categoryFilter === 'Navigation' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Navigation')}
              >
                Navigation
              </button>
              <button
                className={`components-filter-btn ${categoryFilter === 'Electrical' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Electrical')}
              >
                Electrical
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="components-container">
        {/* Bulk selection bar */}
        {selectedComponents.length > 0 && (
          <div className="bulk-selection-bar">
            <span className="bulk-selection-count">
              {selectedComponents.length} component{selectedComponents.length > 1 ? 's' : ''} selected
            </span>
            <div className="bulk-actions">
              <button 
                onClick={handleBulkMaintenance}
                className="bulk-action-btn"
              >
                <FiTool size={14} />
                Mark Maintained
              </button>
              <button 
                onClick={handleBulkDelete}
                className="bulk-action-btn"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
              <button 
                onClick={clearComponentSelection}
                className="bulk-action-btn"
              >
                <FiX size={14} />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredComponents.length === 0 && (
          <div className="components-empty-state">
            <div className="components-empty-message">
              <FiSettings size={48} className="text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No components found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : 'Get started by adding your first component.'}
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                <button 
                  className="components-empty-action-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  <FiPlus className="mr-2" />
                  Add Component
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid View */}
        {filteredComponents.length > 0 && viewMode === 'grid' && (
          <>
            <div className="components-grid">
              {currentComponents.map(component => (
                <div 
                  key={component.id} 
                  className={`component-card ${getComponentCardClass(component.status)}`}
                >
                  <div className="component-card-header">
                    <div>
                      <h3 className="component-name">{component.name}</h3>
                      <p className="component-type">{component.category || 'Uncategorized'}</p>
                    </div>
                    <span className={`status-badge ${getComponentStatusBadgeClass(component.status)}`}>
                      {getStatusDisplayName(component.status)}
                    </span>
                  </div>
                  
                  <div className="component-card-body">
                    <div className="component-ship">
                      <div className="component-ship-icon">
                        <FiAnchor size={12} />
                      </div>
                      <span className="component-ship-name">{getShipName(component.shipId)}</span>
                    </div>
                    
                    <div className="component-details">
                      <div className="component-detail-item">
                        <div className="component-detail-label">Serial Number</div>
                        <div className="component-detail-value">{component.serialNumber || 'N/A'}</div>
                      </div>
                      <div className="component-detail-item">
                        <div className="component-detail-label">Installed</div>
                        <div className="component-detail-value">
                          {component.installationDate ? 
                            format(new Date(component.installationDate), 'MMM d, yyyy') : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Health Meter */}
                    <div className="health-meter">
                      <div className="health-bar">
                        <div 
                          className={`health-fill ${getHealthScoreColorClass(component.healthScore)}`}
                          style={{ width: `${component.healthScore || 0}%` }}
                        ></div>
                      </div>
                      <div className="health-score">
                        <span>Health</span>
                        <span>{component.healthScore || 0}%</span>
                      </div>
                    </div>
                    
                    {/* Maintenance Alert */}
                    {component.status === 'needs_maintenance' && (
                      <div className="alert alert-warning">
                        <FiAlertTriangle size={14} />
                        <span>
                          {component.nextMaintenanceDate ? 
                            `Maintenance due ${formatDistanceToNow(new Date(component.nextMaintenanceDate))}` : 
                            'Maintenance needed'
                          }
                        </span>
                      </div>
                    )}
                    
                    {component.status === 'critical' && (
                      <div className="alert alert-danger">
                        <FiAlertTriangle size={14} />
                        <span>Critical: Immediate attention required</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="component-card-footer">
                    <div className="component-maintenance-date">
                      <FiCalendar size={12} />
                      {component.lastMaintenanceDate ? 
                        `Last maintained: ${format(new Date(component.lastMaintenanceDate), 'MMM d, yyyy')}` : 
                        'Never maintained'
                      }
                    </div>
                    
                    <div className="component-actions">
                      <button 
                        className="component-action-btn view"
                        onClick={() => handleViewDetailsClick(component)}
                        aria-label="View details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        className="component-action-btn edit"
                        onClick={() => handleEditClick(component)}
                        aria-label="Edit component"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        className="component-action-btn delete"
                        onClick={() => handleDeleteClick(component)}
                        aria-label="Delete component"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="components-pagination">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Mobile card list view for List mode */}
        {filteredComponents.length > 0 && viewMode === 'list' && isMobile && (
          <div className="component-list-view-mobile">
            {currentComponents.map(component => (
              <div key={component.id} className="mobile-component-card">
                <div className="mobile-component-header">
                  <div>
                    <h3 className="component-name">{component.name}</h3>
                    <p className="component-type">{component.category || 'Uncategorized'}</p>
                  </div>
                  <span className={`status-badge ${getComponentStatusBadgeClass(component.status)}`}>
                    {getStatusDisplayName(component.status)}
                  </span>
                </div>
                
                <div className="mobile-component-content">
                  <div className="mobile-data-row">
                    <div className="mobile-data-label">Ship:</div>
                    <div className="mobile-data-value">{getShipName(component.shipId)}</div>
                  </div>
                  <div className="mobile-data-row">
                    <div className="mobile-data-label">Serial Number:</div>
                    <div className="mobile-data-value">{component.serialNumber || 'N/A'}</div>
                  </div>
                  <div className="mobile-data-row">
                    <div className="mobile-data-label">Installed:</div>
                    <div className="mobile-data-value">
                      {component.installationDate ? 
                        format(new Date(component.installationDate), 'MMM d, yyyy') : 
                        'N/A'
                      }
                    </div>
                  </div>
                  <div className="mobile-data-row">
                    <div className="mobile-data-label">Health:</div>
                    <div className="mobile-data-value">{component.healthScore || 0}%</div>
                  </div>
                </div>
                
                <div className="mobile-component-footer">
                  <div className="component-maintenance-date">
                    <FiCalendar size={12} />
                    {component.lastMaintenanceDate ? 
                      `Last: ${format(new Date(component.lastMaintenanceDate), 'MMM d, yyyy')}` : 
                      'Never maintained'
                    }
                  </div>
                  
                  <div className="component-actions">
                    <button 
                      className="component-action-btn view"
                      onClick={() => handleViewDetailsClick(component)}
                      aria-label="View details"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      className="component-action-btn edit"
                      onClick={() => handleEditClick(component)}
                      aria-label="Edit component"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      className="component-action-btn delete"
                      onClick={() => handleDeleteClick(component)}
                      aria-label="Delete component"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination for mobile list view */}
            {totalPages > 1 && (
              <div className="components-pagination">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Desktop/Tablet Table View */}
        {filteredComponents.length > 0 && viewMode === 'list' && !isMobile && (
          <div className="components-table-container">
            <table className="components-table">
              <thead>
                <tr>
                  <th>
                    <div 
                      className="component-checkbox"
                      onClick={handleSelectAll}
                    >
                      {selectedComponents.length === currentComponents.length && currentComponents.length > 0 ? (
                        <FiCheckSquare className="checkbox-icon" />
                      ) : (
                        <FiSquare className="checkbox-icon" />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="sortable-header" onClick={() => handleSort('name')}>
                      Component
                      {sortField === 'name' && (
                        <FiChevronDown 
                          className="sort-icon" 
                          style={{ 
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 1
                          }} 
                        />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="sortable-header" onClick={() => handleSort('shipId')}>
                      Ship
                      {sortField === 'shipId' && (
                        <FiChevronDown 
                          className="sort-icon" 
                          style={{ 
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 1
                          }} 
                        />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="sortable-header" onClick={() => handleSort('status')}>
                      Status
                      {sortField === 'status' && (
                        <FiChevronDown 
                          className="sort-icon" 
                          style={{ 
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 1
                          }} 
                        />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="sortable-header" onClick={() => handleSort('serialNumber')}>
                      Serial Number
                      {sortField === 'serialNumber' && (
                        <FiChevronDown 
                          className="sort-icon" 
                          style={{ 
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 1
                          }} 
                        />
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="sortable-header" onClick={() => handleSort('lastMaintenanceDate')}>
                      Last Maintenance
                      {sortField === 'lastMaintenanceDate' && (
                        <FiChevronDown 
                          className="sort-icon" 
                          style={{ 
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                            opacity: 1
                          }} 
                        />
                      )}
                    </div>
                  </th>
                  <th>Health</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentComponents.map((component) => (
                  <tr key={component.id}>
                    <td>
                      <div 
                        className="component-checkbox"
                        onClick={() => toggleComponentSelection(component.id)}
                      >
                        {selectedComponents.includes(component.id) ? (
                          <FiCheckSquare className="checkbox-icon" />
                        ) : (
                          <FiSquare className="checkbox-icon" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`component-type-icon ${component.category?.toLowerCase() || ''}`}>
                          {getComponentTypeIcon(component.category)}
                        </div>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-xs text-gray-500">{component.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getShipName(component.shipId)}</td>
                    <td>
                      <span className={`status-badge ${getComponentStatusBadgeClass(component.status)}`}>
                        {getStatusDisplayName(component.status)}
                      </span>
                    </td>
                    <td>{component.serialNumber || 'N/A'}</td>
                    <td>
                      {component.lastMaintenanceDate ? 
                        format(new Date(component.lastMaintenanceDate), 'MMM d, yyyy') : 
                        'N/A'
                      }
                    </td>
                    <td>
                      <div className="health-meter">
                        <div className="health-bar">
                          <div 
                            className={`health-fill ${getHealthScoreColorClass(component.healthScore)}`}
                            style={{ width: `${component.healthScore || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="component-actions">
                        <button 
                          className="component-action-btn view"
                          onClick={() => handleViewDetailsClick(component)}
                          aria-label="View details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button 
                          className="component-action-btn edit"
                          onClick={() => handleEditClick(component)}
                          aria-label="Edit component"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          className="component-action-btn delete"
                          onClick={() => handleDeleteClick(component)}
                          aria-label="Delete component"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination for table view */}
            {totalPages > 1 && (
              <div className="components-pagination">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Component Modal */}
      <ComponentModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      {/* Edit Component Modal */}
      <ComponentModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        component={selectedComponent} 
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Component"
        message={`Are you sure you want to delete ${selectedComponent?.name}?`}
      />
      
      {/* Component Details Modal */}
      <ComponentDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        componentId={selectedComponent?.id}
        onEdit={(componentId) => {
          const component = components.find(c => c.id === componentId);
          setSelectedComponent(component);
          setShowEditModal(true);
        }}
        onDelete={(componentId) => {
          const component = components.find(c => c.id === componentId);
          setSelectedComponent(component);
          setShowDeleteModal(true);
        }}
      />
    </div>
  );
};

export default ComponentList; 