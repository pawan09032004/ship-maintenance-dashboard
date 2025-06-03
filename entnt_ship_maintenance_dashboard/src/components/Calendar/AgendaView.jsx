import { useMemo } from 'react';
import { format, isToday, isTomorrow, isAfter, addDays, isBefore, isThisWeek, isThisMonth } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';
import PropTypes from 'prop-types';
import { FiClock, FiAnchor, FiSettings, FiUser } from 'react-icons/fi';

const AgendaView = ({ onSelectJob }) => {
  const { calendarJobs } = useCalendar();
  
  // Group events by date for the agenda view
  const groupedEvents = useMemo(() => {
    const groups = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      upcoming: [],
      past: [],
    };
    
    const now = new Date();
    
    calendarJobs.forEach(event => {
      if (isToday(event.start)) {
        groups.today.push(event);
      } else if (isTomorrow(event.start)) {
        groups.tomorrow.push(event);
      } else if (isThisWeek(event.start) && isAfter(event.start, addDays(now, 1))) {
        groups.thisWeek.push(event);
      } else if (isAfter(event.start, now)) {
        groups.upcoming.push(event);
      } else {
        groups.past.push(event);
      }
    });
    
    // Sort events within each group by start time
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.start - b.start);
    });
    
    return groups;
  }, [calendarJobs]);
  
  // Get priority class
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
  
  // Get status class
  const getStatusClass = (status) => {
    switch(status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'in-progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-scheduled';
    }
  };
  
  // Format date for agenda section
  const formatAgendaDate = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else if (isThisMonth(date)) {
      return format(date, 'EEEE, MMMM d');
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };
  
  // Render a group of events
  const renderEventGroup = (title, events, showDate = true) => {
    if (events.length === 0) return null;
    
    return (
      <div className="agenda-group">
        <h3 className="agenda-title">{title}</h3>
        <div className="agenda-jobs">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`agenda-job ${getStatusClass(event.status)}`}
              onClick={() => onSelectJob(event)}
            >
              {showDate && (
                <div className="agenda-date">
                  {formatAgendaDate(event.start)}
                </div>
              )}
              
              <div className="agenda-time">
                <FiClock size={14} className="mr-1" />
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
              </div>
              
              <div className="agenda-details">
                <h4 className="agenda-job-title">{event.title}</h4>
                <div className="agenda-meta">
                  <span className="agenda-ship">
                    <FiAnchor size={14} className="mr-1" />
                    {event.shipName}
                  </span>
                  <span className="agenda-component">
                    <FiSettings size={14} className="mr-1" />
                    {event.componentName}
                  </span>
                  <span className="agenda-engineer">
                    <FiUser size={14} className="mr-1" />
                    {event.engineerName}
                  </span>
                </div>
              </div>
              
              <div className="agenda-priority">
                <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                  {event.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="agenda-view">
      {renderEventGroup('Today', groupedEvents.today, false)}
      {renderEventGroup('Tomorrow', groupedEvents.tomorrow, false)}
      {renderEventGroup('This Week', groupedEvents.thisWeek)}
      {renderEventGroup('Upcoming', groupedEvents.upcoming)}
      {renderEventGroup('Past Jobs', groupedEvents.past)}
      
      {Object.values(groupedEvents).every(group => group.length === 0) && (
        <div className="no-events">
          <p>No maintenance jobs scheduled in this period.</p>
        </div>
      )}
    </div>
  );
};

AgendaView.propTypes = {
  onSelectJob: PropTypes.func.isRequired
};

export default AgendaView; 