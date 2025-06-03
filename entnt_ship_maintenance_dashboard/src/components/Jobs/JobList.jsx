import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../contexts/JobsContext';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { format } from 'date-fns';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiEye, FiEdit2, 
  FiTrash2, FiPlus, FiAnchor, FiSettings, FiCalendar, 
  FiClock, FiCheckSquare, FiAlertTriangle, FiSliders 
} from 'react-icons/fi';
import './JobsStyles.css';

// Job priority badge mapping
const getJobPriorityBadgeClass = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high':
      return 'job-priority-high';
    case 'medium':
      return 'job-priority-medium';
    case 'low':
      return 'job-priority-low';
    default:
      return 'job-priority-medium';
  }
};

// Job type icon mapping
const getJobTypeIcon = (type) => {
  switch(type?.toLowerCase()) {
    case 'inspection':
      return <FiEye className="h-4 w-4" />;
    case 'repair':
      return <FiSettings className="h-4 w-4" />;
    case 'maintenance':
      return <FiClock className="h-4 w-4" />;
    default:
      return <FiSettings className="h-4 w-4" />;
  }
};

const getJobCardClass = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
    default:
      return 'priority-medium';
  }
};

const JobList = () => {
  const { jobs, jobStatuses, jobPriorities, deleteJob } = useJobs();
  const { ships } = useShips();
  const { components } = useComponents();
  
  // Basic filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [shipFilter, setShipFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [engineerFilter, setEngineerFilter] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [estimatedHoursMin, setEstimatedHoursMin] = useState(0);
  const [estimatedHoursMax, setEstimatedHoursMax] = useState(24);

  const getShipName = (shipId) => {
    const ship = ships.find(s => s.id === shipId);
    return ship ? ship.name : 'Unknown Ship';
  };

  const getComponentName = (componentId) => {
    const component = components.find(c => c.id === componentId);
    return component ? component.name : 'Unknown Component';
  };

  const getEngineerName = (engineerId) => {
    if (!engineerId) return 'Unassigned';
    
    const engineers = {
      '1': 'John Smith',
      '2': 'Maria Rodriguez',
      '3': 'David Chen'
    };
    
    return engineers[engineerId] || 'Unknown Engineer';
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  // Filter jobs based on all filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search term filter
      const matchesSearch = 
        (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.jobNumber && job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        getShipName(job.shipId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getComponentName(job.componentId).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Basic filters
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
      const matchesShip = shipFilter === 'all' || job.shipId === shipFilter;
      
      // Advanced filters
      const matchesJobType = jobTypeFilter === 'all' || job.jobType === jobTypeFilter;
      const matchesEngineer = engineerFilter === 'all' || job.assignedEngineerId === engineerFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRangeStart && dateRangeEnd) {
        const jobDate = new Date(job.scheduledDate);
        const startDate = new Date(dateRangeStart);
        const endDate = new Date(dateRangeEnd);
        endDate.setHours(23, 59, 59); // Include the entire end day
        
        matchesDateRange = jobDate >= startDate && jobDate <= endDate;
      }
      
      // Estimated hours filter
      const jobHours = job.estimatedHours || 0;
      const matchesHours = jobHours >= estimatedHoursMin && jobHours <= estimatedHoursMax;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesShip && 
             matchesJobType && matchesEngineer && matchesDateRange && matchesHours;
    });
  }, [
    jobs, searchTerm, statusFilter, priorityFilter, shipFilter, 
    jobTypeFilter, engineerFilter, dateRangeStart, dateRangeEnd,
    estimatedHoursMin, estimatedHoursMax
  ]);

  // Group jobs by status for kanban view
  const kanbanColumns = useMemo(() => {
    const columns = {};
    
    jobStatuses.forEach(status => {
      columns[status] = filteredJobs.filter(job => job.status === status);
    });
    
    return columns;
  }, [filteredJobs, jobStatuses]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setShipFilter('all');
    setJobTypeFilter('all');
    setEngineerFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
    setEstimatedHoursMin(0);
    setEstimatedHoursMax(24);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--status-pending)';
      case 'assigned': return 'var(--status-assigned)';
      case 'in-progress': return 'var(--status-progress)';
      case 'on-hold': return 'var(--status-hold)';
      case 'completed': return 'var(--status-completed)';
      case 'cancelled': return 'var(--status-cancelled)';
      default: return 'var(--status-pending)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'var(--priority-low)';
      case 'medium': return 'var(--priority-medium)';
      case 'high': return 'var(--priority-high)';
      case 'critical': return 'var(--priority-critical)';
      default: return 'var(--priority-medium)';
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1 className="jobs-title">Maintenance Jobs</h1>
        <Link to="/jobs/new" className="btn btn-primary">
          <FiPlus className="mr-2" />
          Create New Job
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="jobs-search-container">
        <FiSearch className="jobs-search-icon" />
        <input
          type="text"
          placeholder="Search jobs by title, number, description, ship or component..."
          className="jobs-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="jobs-filters">
          <button 
            className={`jobs-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <FiFilter size={14} />
            All Status
          </button>
          {jobStatuses.map(status => (
            <button 
              key={status}
              className={`jobs-filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
              style={statusFilter === status ? { backgroundColor: getStatusColor(status) } : {}}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="jobs-filters">
          <button 
            className={`jobs-filter-btn ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('all')}
          >
            All Priority
          </button>
          {jobPriorities.map(priority => (
            <button 
              key={priority}
              className={`jobs-filter-btn ${priorityFilter === priority ? 'active' : ''}`}
              onClick={() => setPriorityFilter(priority)}
              style={priorityFilter === priority ? { backgroundColor: getPriorityColor(priority) } : {}}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-grow"></div>

        <select 
          className="input w-auto"
          value={shipFilter}
          onChange={(e) => setShipFilter(e.target.value)}
        >
          <option value="all">All Ships</option>
          {ships.map(ship => (
            <option key={ship.id} value={ship.id}>{ship.name}</option>
          ))}
        </select>

        <button 
          className="jobs-filter-btn"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <FiSliders size={14} />
          Advanced Filters
        </button>

        <div className="jobs-view-toggle">
          <button 
            className={`jobs-view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban View"
          >
            <FiGrid size={16} />
          </button>
          <button 
            className={`jobs-view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <FiList size={16} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters mb-6">
          <div className="filter-row">
            <div className="filter-group">
              <label>Job Type</label>
              <select 
                className="filter-select"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="routine">Routine</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="overhaul">Overhaul</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Engineer</label>
              <select 
                className="filter-select"
                value={engineerFilter}
                onChange={(e) => setEngineerFilter(e.target.value)}
              >
                <option value="all">All Engineers</option>
                <option value="">Unassigned</option>
                <option value="1">John Smith</option>
                <option value="2">Maria Rodriguez</option>
                <option value="3">David Chen</option>
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="date-input" 
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
                <span>to</span>
                <input 
                  type="date" 
                  className="date-input"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Estimated Hours: {estimatedHoursMin} - {estimatedHoursMax}</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  value={estimatedHoursMin}
                  onChange={(e) => setEstimatedHoursMin(parseInt(e.target.value))}
                  className="range-slider"
                />
                <span>to</span>
                <input 
                  type="range" 
                  min="0" 
                  max="24" 
                  value={estimatedHoursMax}
                  onChange={(e) => setEstimatedHoursMax(parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              className="btn btn-secondary"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredJobs.length} jobs
        {statusFilter !== 'all' && ` with status "${statusFilter}"`}
        {priorityFilter !== 'all' && ` and priority "${priorityFilter}"`}
        {shipFilter !== 'all' && ` for ${getShipName(shipFilter)}`}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="kanban-container">
          {jobStatuses.map(status => (
            <div key={status} className={`kanban-column ${status}`}>
              <div className="kanban-column-header">
                <h3 className="kanban-column-title">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="kanban-column-count">{kanbanColumns[status].length}</span>
                </h3>
              </div>
              <div className="kanban-cards">
                {kanbanColumns[status].length > 0 ? (
                  kanbanColumns[status].map((job) => (
                    <div key={job.id} className={`job-card priority-${job.priority}`}>
                      <div className="job-card-header">
                        <div>
                          <h3 className="job-title">{job.title}</h3>
                          <p className="job-number">{job.jobNumber}</p>
                          <p className="job-type">
                            <FiAnchor className="mr-1" size={14} />
                            {getShipName(job.shipId)}
                          </p>
                        </div>
                        <span className={`job-priority-badge job-priority-${job.priority}`}>
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                        </span>
                      </div>
                      <div className="job-card-body">
                        <div className="job-component">
                          <div className="job-component-icon">
                            <FiSettings size={14} />
                          </div>
                          <span className="job-component-name">{getComponentName(job.componentId)}</span>
                        </div>
                        <div className="job-details">
                          <div className="job-detail-item">
                            <span className="job-detail-label">Scheduled</span>
                            <span className="job-detail-value">{format(new Date(job.scheduledDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="job-detail-item">
                            <span className="job-detail-label">Due</span>
                            <span className="job-detail-value">{format(new Date(job.dueDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="job-detail-item">
                            <span className="job-detail-label">Engineer</span>
                            <span className="job-detail-value">{getEngineerName(job.assignedEngineerId)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="job-card-footer">
                        <span className="job-date">
                          <FiCalendar className="mr-1" size={14} />
                          Updated: {format(new Date(job.updatedAt), 'MMM dd, yyyy')}
                        </span>
                        <div className="job-actions">
                          <Link to={`/jobs/${job.id}`} className="job-action-btn">
                            <FiEye size={14} />
                          </Link>
                          <Link to={`/jobs/${job.id}/edit`} className="job-action-btn edit">
                            <FiEdit2 size={14} />
                          </Link>
                          <button 
                            className="job-action-btn delete"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No jobs in this status
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ship / Component
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engineer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.jobNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getShipName(job.shipId)}</div>
                      <div className="text-sm text-gray-500">{getComponentName(job.componentId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                        style={{ backgroundColor: getStatusColor(job.status) }}
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                        style={{ backgroundColor: getPriorityColor(job.priority) }}
                      >
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEngineerName(job.assignedEngineerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" size={12} />
                          Due: {format(new Date(job.dueDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center mt-1">
                          <FiClock className="mr-1" size={12} />
                          {job.estimatedHours} hrs
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-900">
                          <FiEye size={18} />
                        </Link>
                        <Link to={`/jobs/${job.id}/edit`} className="text-cyan-600 hover:text-cyan-900">
                          <FiEdit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteJob(job.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredJobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No jobs match your filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList; 