import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useShips } from '../../contexts/ShipsContext';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiAnchor,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCalendar,
  FiRefreshCw,
  FiSliders,
  FiHome,
  FiChevronRight
} from 'react-icons/fi';
import './ShipsStyles.css';
import './TableFix.css';

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

// CSV Export function
const exportToCSV = (ships) => {
  const headers = ['Name', 'Type', 'IMO', 'Flag', 'Status', 'Last Maintenance', 'Year Built'];
  
  const csvData = ships.map(ship => [
    ship.name,
    ship.type,
    ship.imo || '',
    ship.flag || '',
    ship.status || '',
    ship.lastMaintenance ? new Date(ship.lastMaintenance).toLocaleDateString() : '',
    ship.yearBuilt || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ships_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ShipList = () => {
  const { ships, deleteShip } = useShips();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shipToDelete, setShipToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const filterPanelRef = useRef(null);
  
  // Get unique ship types for filter dropdown
  const shipTypes = [...new Set(ships.map(ship => ship.type))];
  
  // Get unique years for filter dropdown
  const shipYears = [...new Set(ships.map(ship => ship.yearBuilt).filter(Boolean))].sort((a, b) => b - a);
  
  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Close advanced filters panel when clicking outside
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setShowAdvancedFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sort ships
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle ship deletion
  const handleDeleteClick = (ship) => {
    setShipToDelete(ship);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (shipToDelete) {
      deleteShip(shipToDelete.id);
      setShowDeleteModal(false);
      setShipToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShipToDelete(null);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setYearFilter('all');
  };

  // Filter and sort ships
  const filteredAndSortedShips = () => {
    // Apply filters
    let filtered = ships.filter(ship => {
      const matchesSearch = !searchTerm || 
        ship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ship.imo && ship.imo.includes(searchTerm)) ||
        (ship.description && ship.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (ship.status && ship.status.toLowerCase() === statusFilter.toLowerCase());
      
      const matchesType = typeFilter === 'all' || 
        (ship.type && ship.type === typeFilter);
      
      const matchesYear = yearFilter === 'all' || 
        (ship.yearBuilt && ship.yearBuilt.toString() === yearFilter);
      
      return matchesSearch && matchesStatus && matchesType && matchesYear;
    });
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle null values
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        // Special case for dates
        if (sortConfig.key === 'lastMaintenance') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // Default string comparison
        const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  };
  
  const finalShips = filteredAndSortedShips();
  
  // Render sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 
        <FiChevronUp className="sort-icon" /> : 
        <FiChevronDown className="sort-icon" />;
    }
    return null;
  };
  
  // Determine if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || yearFilter !== 'all' || searchTerm;

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">
          <FiHome className="breadcrumb-icon" />
          <span>Home</span>
        </Link>
        <FiChevronRight className="breadcrumb-separator" />
        <span className="breadcrumb-current">Ships</span>
      </div>
      
      <div className="ships-container">
        <div className="ships-header">
          <h1 className="ships-title">Ship Management</h1>
          <div className="ships-header-actions">
            <button 
              className="maritime-btn maritime-btn-secondary"
              onClick={() => exportToCSV(finalShips)}
              disabled={finalShips.length === 0}
            >
              <FiDownload className="mr-2" />
              Export
            </button>
            <Link to="/ships/new" className="maritime-btn maritime-btn-primary">
              <FiPlus className="mr-2" />
              Add New Ship
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="ships-toolbar">
          <div className="ships-search-container">
            <FiSearch className="ships-search-icon" />
            <input
              type="text"
              placeholder="Search ships by name, IMO or description..."
              className="ships-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="ships-search-clear" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
          
          <div className="ships-toolbar-actions">
            {hasActiveFilters && (
              <button 
                className="ships-toolbar-btn ships-toolbar-btn-text"
                onClick={resetFilters}
              >
                <FiRefreshCw className="mr-1" />
                Reset Filters
              </button>
            )}
            <div className="ships-advanced-filter-container" ref={filterPanelRef}>
              <button 
                className={`ships-toolbar-btn ${showAdvancedFilters ? 'active' : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FiSliders className="mr-1" />
                Filters
              </button>
              
              {showAdvancedFilters && (
                <div className="ships-advanced-filters-panel">
                  <div className="ships-advanced-filters-header">
                    <h3>Advanced Filters</h3>
                    <button 
                      className="ships-advanced-filters-close"
                      onClick={() => setShowAdvancedFilters(false)}
                    >
                      <FiX />
                    </button>
                  </div>
                  
                  <div className="ships-advanced-filters-body">
                    <div className="ships-advanced-filter-group">
                      <label>Status</label>
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="ships-advanced-filter-select"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="under maintenance">Under Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="ships-advanced-filter-group">
                      <label>Ship Type</label>
                      <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="ships-advanced-filter-select"
                      >
                        <option value="all">All Types</option>
                        {shipTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="ships-advanced-filter-group">
                      <label>Year Built</label>
                      <select 
                        value={yearFilter} 
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="ships-advanced-filter-select"
                      >
                        <option value="all">All Years</option>
                        {shipYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="ships-advanced-filters-footer">
                    <button 
                      className="ships-filter-btn"
                      onClick={resetFilters}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ships-filters">
          <button 
            className={`ships-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <FiFilter size={14} />
            All
          </button>
          <button 
            className={`ships-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button 
            className={`ships-filter-btn ${statusFilter === 'under maintenance' ? 'active' : ''}`}
            onClick={() => setStatusFilter('under maintenance')}
          >
            Under Maintenance
          </button>
          <button 
            className={`ships-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive
          </button>
        </div>

        {/* Ships Table */}
        <div className="ships-table-container">
          {isLoading ? (
            <div className="ships-loading">
              <div className="ships-loading-spinner"></div>
              <span>Loading ships...</span>
            </div>
          ) : (
            <table className="ships-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('name')} className="sortable-header">
                    <div className="th-content">
                      <span>Ship</span>
                      {getSortIndicator('name')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('imo')} className="sortable-header">
                    <div className="th-content">
                      <span>IMO Number</span>
                      {getSortIndicator('imo')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('flag')} className="sortable-header">
                    <div className="th-content">
                      <span>Flag</span>
                      {getSortIndicator('flag')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('status')} className="sortable-header">
                    <div className="th-content">
                      <span>Status</span>
                      {getSortIndicator('status')}
                    </div>
                  </th>
                  <th onClick={() => requestSort('lastMaintenance')} className="sortable-header">
                    <div className="th-content">
                      <span>Last Maintenance</span>
                      {getSortIndicator('lastMaintenance')}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {finalShips.length > 0 ? (
                  finalShips.map((ship) => (
                    <tr key={ship.id} className="ship-row">
                      <td>
                        <div className="ship-cell">
                          <div className="ship-icon">
                            <FiAnchor size={16} />
                          </div>
                          <div className="ship-info">
                            <div className="ship-name">{ship.name}</div>
                            <div className="ship-type">{ship.type}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ship-imo">{ship.imo || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="ship-flag">
                          {ship.flag && (
                            <span className="ship-flag-emoji">{getFlagEmoji(ship.flag)}</span>
                          )}
                          <span className="ship-flag-name">{ship.flag || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`ship-status-badge ${getStatusBadgeClass(ship.status)}`}>
                          {ship.status}
                        </span>
                      </td>
                      <td>
                        <div className="ship-maintenance-date">
                          <FiCalendar className="ship-calendar-icon" size={14} />
                          {ship.lastMaintenance ? new Date(ship.lastMaintenance).toLocaleDateString() : 'Not available'}
                        </div>
                      </td>
                      <td>
                        <div className="ship-actions">
                          <Link to={`/ships/${ship.id}`} className="ship-action-btn" title="View Details">
                            <FiEye size={16} />
                          </Link>
                          <Link to={`/ships/${ship.id}/edit`} className="ship-action-btn edit" title="Edit Ship">
                            <FiEdit2 size={16} />
                          </Link>
                          <button 
                            className="ship-action-btn delete" 
                            onClick={() => handleDeleteClick(ship)}
                            title="Delete Ship"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="ships-empty-state">
                      {hasActiveFilters ? (
                        <div className="ships-empty-message">
                          <FiFilter size={32} />
                          <p>No ships match your search criteria</p>
                          <button 
                            className="ships-empty-action-btn"
                            onClick={resetFilters}
                          >
                            Clear Filters
                          </button>
                        </div>
                      ) : (
                        <div className="ships-empty-message">
                          <FiAnchor size={32} />
                          <p>No ships available. Add your first ship!</p>
                          <Link to="/ships/new" className="ships-empty-action-btn">
                            Add Ship
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Results count */}
        {!isLoading && finalShips.length > 0 && (
          <div className="ships-results-count">
            Showing {finalShips.length} of {ships.length} ships
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
                <p>Are you sure you want to delete the ship "{shipToDelete?.name}"?</p>
                <p className="modal-warning">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="maritime-btn maritime-btn-secondary"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="maritime-btn maritime-btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipList; 