import { useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, differenceInMinutes, isToday } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';
import PropTypes from 'prop-types';

// Generate hour slots for the day
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeeklyView = ({ onSelectJob, onCreateJob }) => {
  const { currentDate, getEventsForWeek } = useCalendar();
  
  // Get the start of the week for the current date
  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  
  // Generate days for the week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);
  
  // Get all events for the current week
  const weekEvents = useMemo(() => getEventsForWeek(), [getEventsForWeek]);
  
  // Calculate event position and height
  const calculateEventPosition = (event) => {
    // Calculate start position (in pixels) based on event start time
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const top = (startHour * 60 + startMinute) * (60 / 60);
    
    // Calculate event height based on duration
    const durationMinutes = differenceInMinutes(event.end, event.start);
    const height = Math.max(durationMinutes * (60 / 60), 30); // Minimum height of 30px
    
    return { top, height };
  };
  
  // Get events for a specific day
  const getEventsForDay = (day) => {
    return weekEvents.filter(event => isSameDay(event.start, day));
  };
  
  // Handle event click
  const handleEventClick = (event) => {
    onSelectJob(event);
  };
  
  // Handle cell click for event creation
  const handleCellClick = (day, hour) => {
    const dateTime = new Date(day);
    dateTime.setHours(hour);
    dateTime.setMinutes(0);
    dateTime.setSeconds(0);
    onCreateJob(dateTime);
  };
  
  return (
    <div className="calendar-weekly">
      {/* Week header with days */}
      <div className="week-header">
        <div className="time-column"></div>
        <div className="day-columns">
          {weekDays.map((day, index) => (
            <div key={index} className="day-column">
              <div className={`day-header ${isToday(day) ? 'today' : ''}`}>
                <span className="day-name">{format(day, 'EEEE')}</span>
                <span className="day-date">{format(day, 'MMM d')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Week body with hour slots and events */}
      <div className="week-body">
        {/* Time slots on the left */}
        <div className="time-slots">
          {HOURS.map((hour) => (
            <div key={hour} className="time-slot">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
            </div>
          ))}
        </div>
        
        {/* Week grid with events */}
        <div className="week-grid">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={dayIndex} className="day-column-body">
                {/* Hour cells for this day */}
                {HOURS.map((hour) => (
                  <div 
                    key={hour} 
                    className="hour-slot"
                    onClick={() => handleCellClick(day, hour)}
                  ></div>
                ))}
                
                {/* Events for this day */}
                {dayEvents.map((event, eventIndex) => {
                  const { top, height } = calculateEventPosition(event);
                  
                  return (
                    <div
                      key={eventIndex}
                      className={`job-block job-${event.jobType}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: '4px',
                        right: '4px',
                        backgroundColor: event.color,
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="job-content">
                        <div className="job-header">
                          <span className="job-title">{event.title}</span>
                          <span className={`job-priority priority-${event.priority}`}>
                            {event.priority}
                          </span>
                        </div>
                        <div className="job-details">
                          <span className="job-ship">{event.shipName}</span>
                          <span className="job-time">
                            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

WeeklyView.propTypes = {
  onSelectJob: PropTypes.func.isRequired,
  onCreateJob: PropTypes.func.isRequired
};

export default WeeklyView; 