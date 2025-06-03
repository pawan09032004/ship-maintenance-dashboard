import { useMemo } from 'react';
import { format, isToday, isTomorrow, addDays, differenceInDays, isPast } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';
import { FiClock, FiAlertTriangle, FiCalendar } from 'react-icons/fi';

const CalendarSidebar = () => {
  const { calendarJobs, handleSelectJob } = useCalendar();
  
  // Get today's jobs
  const todayJobs = useMemo(() => {
    return calendarJobs
      .filter(job => isToday(job.start))
      .sort((a, b) => a.start - b.start);
  }, [calendarJobs]);
  
  // Get upcoming deadlines (jobs due in the next 7 days)
  const upcomingDeadlines = useMemo(() => {
    return calendarJobs
      .filter(job => {
        const dueDate = job.end;
        const daysUntilDue = differenceInDays(dueDate, new Date());
        return daysUntilDue >= 0 && daysUntilDue <= 7 && job.status !== 'completed';
      })
      .sort((a, b) => a.end - b.end)
      .slice(0, 5); // Show only top 5 deadlines
  }, [calendarJobs]);
  
  // Get overdue jobs
  const overdueJobs = useMemo(() => {
    return calendarJobs
      .filter(job => {
        return isPast(job.end) && job.status !== 'completed';
      })
      .sort((a, b) => a.end - b.end)
      .slice(0, 3); // Show only top 3 overdue
  }, [calendarJobs]);
  
  // Format deadline time
  const formatDeadline = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      const days = differenceInDays(date, new Date());
      return `${days} days left`;
    }
  };
  
  return (
    <div className="calendar-sidebar">
      {/* Today's Schedule */}
      <div className="sidebar-section">
        <h3>
          <FiCalendar className="mr-2" />
          Today's Schedule
        </h3>
        <div className="today-jobs">
          {todayJobs.length > 0 ? (
            todayJobs.map((job, index) => (
              <div 
                key={index} 
                className="sidebar-job"
                onClick={() => handleSelectJob(job)}
              >
                <div className="job-time">
                  {format(job.start, 'HH:mm')}
                </div>
                <div className="job-info">
                  <h5>{job.title}</h5>
                  <span className="job-ship">{job.shipName}</span>
                  <div className="job-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${job.job.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <span>{job.job.progressPercentage || 0}% Complete</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No jobs scheduled for today</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="sidebar-section">
        <h3>
          <FiClock className="mr-2" />
          Upcoming Deadlines
        </h3>
        <div className="deadline-alerts">
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((job, index) => {
              const daysLeft = differenceInDays(job.end, new Date());
              const urgency = daysLeft <= 1 ? 'urgent' : 
                             daysLeft <= 3 ? 'warning' : 'normal';
              
              return (
                <div 
                  key={index} 
                  className={`alert-item ${urgency}`}
                  onClick={() => handleSelectJob(job)}
                >
                  <span className="alert-icon">⏱️</span>
                  <div className="alert-content">
                    <h5>{job.title}</h5>
                    <span>Due in {formatDeadline(job.end)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>No upcoming deadlines</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Overdue Jobs */}
      {overdueJobs.length > 0 && (
        <div className="sidebar-section">
          <h3>
            <FiAlertTriangle className="mr-2 text-red-500" />
            Overdue Jobs
          </h3>
          <div className="deadline-alerts">
            {overdueJobs.map((job, index) => (
              <div 
                key={index} 
                className="alert-item urgent"
                onClick={() => handleSelectJob(job)}
              >
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <h5>{job.title}</h5>
                  <span>Overdue by {differenceInDays(new Date(), job.end)} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSidebar; 