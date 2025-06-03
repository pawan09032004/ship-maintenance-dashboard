import { createContext, useContext, useState, useMemo } from 'react';
import { useJobs } from './JobsContext';
import { useShips } from './ShipsContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, addDays, isSameDay, parseISO } from 'date-fns';

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

// Calendar Views
export const calendarViews = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda',
};

export const CalendarProvider = ({ children }) => {
  const { jobs } = useJobs();
  const { ships } = useShips();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(calendarViews.MONTH);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedShips, setSelectedShips] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [draggedJob, setDraggedJob] = useState(null);
  
  // Map jobs to calendar events
  const calendarJobs = useMemo(() => {
    return jobs.map(job => {
      // Parse the dates
      const startDate = job.scheduledDate ? parseISO(job.scheduledDate) : new Date();
      
      // Calculate end date (either from job.endDate or based on estimated hours)
      let endDate;
      if (job.endDate) {
        endDate = parseISO(job.endDate);
      } else if (job.estimatedHours) {
        // If we have estimated hours, add them to the start date
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + (job.estimatedHours || 2));
      } else {
        // Default to 2 hours if no estimated time
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2);
      }

      // Determine color based on priority
      let color;
      switch(job.priority) {
        case 'low':
          color = 'var(--job-routine)';
          break;
        case 'medium':
          color = 'var(--job-inspection)';
          break;
        case 'high':
          color = 'var(--job-repair)';
          break;
        case 'critical':
          color = 'var(--job-emergency)';
          break;
        default:
          color = 'var(--job-inspection)';
      }

      // Find ship name
      const ship = ships.find(s => s.id === job.shipId);
      const shipName = ship ? ship.name : 'Unknown Ship';

      return {
        id: job.id,
        title: job.title,
        jobNumber: job.jobNumber,
        shipName,
        componentName: job.componentName || 'Unknown Component',
        engineerName: job.assignedEngineerId ? `Engineer ${job.assignedEngineerId}` : 'Unassigned',
        priority: job.priority,
        status: job.status,
        start: startDate,
        end: endDate,
        estimatedHours: job.estimatedHours || 2,
        jobType: job.jobType,
        color,
        allDay: false,
        recurring: false,
        recurringPattern: null,
        job // Include the original job data
      };
    });
  }, [jobs, ships]);

  // Filter calendar jobs based on selected filters
  const filteredCalendarJobs = useMemo(() => {
    return calendarJobs.filter(job => {
      const matchesShip = selectedShips.length === 0 || selectedShips.includes(job.job.shipId);
      const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);
      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(job.priority);
      
      return matchesShip && matchesJobType && matchesPriority;
    });
  }, [calendarJobs, selectedShips, selectedJobTypes, selectedPriorities]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return filteredCalendarJobs.filter(job => 
      isSameDay(job.start, date)
    );
  };

  // Get events for the current month view
  const getEventsForMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    return filteredCalendarJobs.filter(job => 
      (job.start >= start && job.start <= end) || 
      (job.end >= start && job.end <= end)
    );
  };

  // Get events for the current week view
  const getEventsForWeek = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    
    return filteredCalendarJobs.filter(job => 
      (job.start >= start && job.start <= end) || 
      (job.end >= start && job.end <= end)
    );
  };

  // Navigate to next period (month, week, day)
  const navigateNext = () => {
    let newDate;
    
    switch(currentView) {
      case calendarViews.MONTH:
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case calendarViews.WEEK:
        newDate = addDays(currentDate, 7);
        break;
      case calendarViews.DAY:
        newDate = addDays(currentDate, 1);
        break;
      default:
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
    }
    
    setCurrentDate(newDate);
  };

  // Navigate to previous period (month, week, day)
  const navigatePrevious = () => {
    let newDate;
    
    switch(currentView) {
      case calendarViews.MONTH:
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case calendarViews.WEEK:
        newDate = addDays(currentDate, -7);
        break;
      case calendarViews.DAY:
        newDate = addDays(currentDate, -1);
        break;
      default:
        newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
    }
    
    setCurrentDate(newDate);
  };

  // Navigate to today
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Handle job selection
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  // Handle job modal close
  const handleCloseJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Toggle ship filter
  const toggleShipFilter = (shipId) => {
    setSelectedShips(prev => {
      if (prev.includes(shipId)) {
        return prev.filter(id => id !== shipId);
      } else {
        return [...prev, shipId];
      }
    });
  };

  // Toggle job type filter
  const toggleJobTypeFilter = (jobType) => {
    setSelectedJobTypes(prev => {
      if (prev.includes(jobType)) {
        return prev.filter(type => type !== jobType);
      } else {
        return [...prev, jobType];
      }
    });
  };

  // Toggle priority filter
  const togglePriorityFilter = (priority) => {
    setSelectedPriorities(prev => {
      if (prev.includes(priority)) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedShips([]);
    setSelectedJobTypes([]);
    setSelectedPriorities([]);
  };

  // Handle drag start
  const handleDragStart = (job) => {
    setDraggedJob(job);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedJob(null);
  };

  const value = {
    currentDate,
    currentView,
    selectedJob,
    showJobModal,
    calendarJobs: filteredCalendarJobs,
    selectedShips,
    selectedJobTypes,
    selectedPriorities,
    draggedJob,
    calendarViews,
    setCurrentDate,
    setCurrentView,
    getEventsForDate,
    getEventsForMonth,
    getEventsForWeek,
    navigateNext,
    navigatePrevious,
    navigateToday,
    handleSelectJob,
    handleCloseJobModal,
    handleViewChange,
    toggleShipFilter,
    toggleJobTypeFilter,
    togglePriorityFilter,
    resetFilters,
    handleDragStart,
    handleDragEnd,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext; 