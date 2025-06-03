import { useCalendar } from '../../contexts/CalendarContext';
import { useShips } from '../../contexts/ShipsContext';
import { jobTypes, jobPriorities } from '../../contexts/JobsContext';
import { FiX, FiRefreshCcw } from 'react-icons/fi';

const CalendarFilters = () => {
  const { 
    selectedShips, 
    selectedJobTypes, 
    selectedPriorities, 
    toggleShipFilter, 
    toggleJobTypeFilter, 
    togglePriorityFilter, 
    resetFilters,
    calendarJobs
  } = useCalendar();
  
  const { ships } = useShips();
  
  // Count jobs for each ship
  const getShipJobCount = (shipId) => {
    return calendarJobs.filter(job => job.job.shipId === shipId).length;
  };
  
  // Count jobs for each job type
  const getJobTypeCount = (jobType) => {
    return calendarJobs.filter(job => job.jobType === jobType).length;
  };
  
  // Count jobs for each priority
  const getPriorityCount = (priority) => {
    return calendarJobs.filter(job => job.priority === priority).length;
  };
  
  // Check if a ship is selected
  const isShipSelected = (shipId) => {
    return selectedShips.includes(shipId);
  };
  
  // Check if a job type is selected
  const isJobTypeSelected = (jobType) => {
    return selectedJobTypes.includes(jobType);
  };
  
  // Check if a priority is selected
  const isPrioritySelected = (priority) => {
    return selectedPriorities.includes(priority);
  };
  
  return (
    <div className="calendar-filters">
      {/* Ship Filters */}
      <div className="filter-section">
        <div className="flex justify-between items-center">
          <h4>Filter by Ships</h4>
          {selectedShips.length > 0 && (
            <button 
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              onClick={() => resetFilters()}
            >
              <FiRefreshCcw size={12} className="mr-1" />
              Reset
            </button>
          )}
        </div>
        <div className="ship-filters">
          {ships.map((ship) => (
            <label key={ship.id} className="filter-checkbox">
              <input 
                type="checkbox" 
                checked={isShipSelected(ship.id)} 
                onChange={() => toggleShipFilter(ship.id)}
              />
              <span className="checkmark"></span>
              <span className="ship-name">{ship.name}</span>
              <span className="job-count">{getShipJobCount(ship.id)}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Job Type Filters */}
      <div className="filter-section">
        <h4>Job Types</h4>
        <div className="type-filters">
          {jobTypes.map((jobType) => (
            <button 
              key={jobType}
              className={`type-filter ${isJobTypeSelected(jobType) ? 'active' : ''}`}
              onClick={() => toggleJobTypeFilter(jobType)}
            >
              {jobType.charAt(0).toUpperCase() + jobType.slice(1)}
              <span className="ml-1 text-xs">{getJobTypeCount(jobType)}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Priority Filters */}
      <div className="filter-section">
        <h4>Priority</h4>
        <div className="type-filters">
          {jobPriorities.map((priority) => (
            <button 
              key={priority}
              className={`type-filter ${isPrioritySelected(priority) ? 'active' : ''}`}
              onClick={() => togglePriorityFilter(priority)}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <span className="ml-1 text-xs">{getPriorityCount(priority)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters; 