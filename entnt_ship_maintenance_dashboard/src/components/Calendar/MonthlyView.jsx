import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, getDay } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';
import PropTypes from 'prop-types';

const MonthlyView = ({ onSelectJob, onCreateJob }) => {
  const { currentDate, getEventsForMonth } = useCalendar();
  
  // Get all dates for the current month view (including padding days)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = new Date(monthStart);
    const calendarEnd = new Date(monthEnd);
    
    // Adjust start to beginning of week
    calendarStart.setDate(calendarStart.getDate() - getDay(calendarStart));
    
    // Adjust end to end of week
    const endDay = getDay(calendarEnd);
    if (endDay < 6) {
      calendarEnd.setDate(calendarEnd.getDate() + (6 - endDay));
    }
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);
  
  // Get all events for the current month
  const monthEvents = useMemo(() => getEventsForMonth(), [getEventsForMonth]);
  
  // Get events for a specific day
  const getEventsForDay = (day) => {
    return monthEvents.filter(event => isSameDay(event.start, day));
  };
  
  // Handle job click
  const handleJobClick = (event, job) => {
    event.stopPropagation();
    onSelectJob(job);
  };
  
  // Handle day click for job creation
  const handleDayClick = (day) => {
    onCreateJob(day);
  };
  
  // Format time to show on job indicators
  const formatEventTime = (date) => {
    return format(date, 'HH:mm');
  };
  
  // Get day cell class based on date
  const getDayClass = (day) => {
    let className = 'calendar-day';
    
    if (!isSameMonth(day, currentDate)) {
      className += ' other-month';
    }
    
    if (isToday(day)) {
      className += ' today';
    }
    
    return className;
  };
  
  // Get job class based on job type
  const getJobClass = (job) => {
    let className = 'job-indicator';
    
    switch(job.jobType) {
      case 'routine':
        className += ' job-routine';
        break;
      case 'repair':
        className += ' job-repair';
        break;
      case 'inspection':
        className += ' job-inspection';
        break;
      case 'emergency':
        className += ' job-emergency';
        break;
      case 'overhaul':
        className += ' job-overhaul';
        break;
      default:
        className += ' job-routine';
    }
    
    if (job.status === 'overdue') {
      className += ' overdue-job';
    }
    
    return className;
  };
  
  return (
    <div className="calendar-monthly">
      {/* Weekday headers */}
      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const displayEvents = dayEvents.slice(0, 3);
          const moreEvents = dayEvents.length > 3 ? dayEvents.length - 3 : 0;
          
          return (
            <div 
              key={index} 
              className={getDayClass(day)}
              onClick={() => handleDayClick(day)}
              data-date={format(day, 'yyyy-MM-dd')}
            >
              <span className="day-number">{format(day, 'd')}</span>
              
              <div className="day-jobs">
                {displayEvents.map((job, idx) => (
                  <div 
                    key={idx} 
                    className={getJobClass(job)}
                    onClick={(e) => handleJobClick(e, job)}
                    title={`${job.title} - ${job.shipName}`}
                  >
                    <span className="job-time">{formatEventTime(job.start)}</span>
                    <span className="job-title">{job.title}</span>
                  </div>
                ))}
                
                {moreEvents > 0 && (
                  <div className="more-jobs" onClick={(e) => {
                    e.stopPropagation();
                    // This could open a popup with all events for the day
                    onCreateJob(day);
                  }}>
                    +{moreEvents} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

MonthlyView.propTypes = {
  onSelectJob: PropTypes.func.isRequired,
  onCreateJob: PropTypes.func.isRequired
};

export default MonthlyView; 