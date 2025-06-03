import { useMemo } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';
import PropTypes from 'prop-types';

// Generate hour slots for the day
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView = ({ onSelectJob, onCreateJob }) => {
  const { currentDate, getEventsForDate } = useCalendar();
  
  // Get all events for the current day
  const dayEvents = useMemo(() => getEventsForDate(currentDate), [getEventsForDate, currentDate]);
  
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
  
  // Handle event click
  const handleEventClick = (event) => {
    onSelectJob(event);
  };
  
  // Handle cell click for event creation
  const handleCellClick = (hour) => {
    const dateTime = new Date(currentDate);
    dateTime.setHours(hour);
    dateTime.setMinutes(0);
    dateTime.setSeconds(0);
    onCreateJob(dateTime);
  };
  
  return (
    <div className="calendar-day-view">
      {/* Day header */}
      <div className="day-view-header">
        <h3 className="day-title">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
      </div>
      
      {/* Day body with hour slots and events */}
      <div className="day-view-body">
        {/* Time slots on the left */}
        <div className="time-slots">
          {HOURS.map((hour) => (
            <div key={hour} className="time-slot">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
            </div>
          ))}
        </div>
        
        {/* Day grid with events */}
        <div className="day-grid">
          {/* Hour cells */}
          <div className="hour-cells">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="hour-slot"
                onClick={() => handleCellClick(hour)}
              ></div>
            ))}
          </div>
          
          {/* Current time indicator */}
          <div 
            className="current-time-indicator" 
            style={{ 
              top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (60 / 60)}px` 
            }}
          ></div>
          
          {/* Events */}
          <div className="events-container">
            {dayEvents.map((event, index) => {
              const { top, height } = calculateEventPosition(event);
              const width = `calc(95% - ${event.concurrent ? event.concurrentIndex * 10 : 0}px)`;
              const left = event.concurrent ? `${event.concurrentIndex * 5}%` : '2.5%';
              
              return (
                <div
                  key={index}
                  className={`job-block job-${event.jobType}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left,
                    width,
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
                      <span className="job-component">{event.componentName}</span>
                      <span className="job-time">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </span>
                      <span className="job-engineer">{event.engineerName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

DayView.propTypes = {
  onSelectJob: PropTypes.func.isRequired,
  onCreateJob: PropTypes.func.isRequired
};

export default DayView; 