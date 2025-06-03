import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiFilter, FiList, FiGrid } from 'react-icons/fi';
import { useCalendar } from '../../contexts/CalendarContext';
import MonthlyView from './MonthlyView';
import WeeklyView from './WeeklyView';
import DayView from './DayView';
import AgendaView from './AgendaView';
import CalendarSidebar from './CalendarSidebar';
import CalendarFilters from './CalendarFilters';
import JobDetailModal from './JobDetailModal';
import QuickCreateModal from './QuickCreateModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const {
    currentDate,
    currentView,
    showJobModal,
    selectedJob,
    calendarJobs,
    calendarViews,
    setCurrentDate,
    navigateNext,
    navigatePrevious,
    navigateToday,
    handleViewChange,
    handleSelectJob,
    handleCloseJobModal,
  } = useCalendar();

  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Format the current date based on view
  const formatViewTitle = () => {
    switch (currentView) {
      case calendarViews.MONTH:
        return format(currentDate, 'MMMM yyyy');
      case calendarViews.WEEK:
        const weekStart = startOfWeek(currentDate);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case calendarViews.DAY:
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Map view names for display
  const getViewName = (view) => {
    switch (view) {
      case calendarViews.MONTH:
        return 'Month';
      case calendarViews.WEEK:
        return 'Week';
      case calendarViews.DAY:
        return 'Day';
      case calendarViews.AGENDA:
        return 'Agenda';
      default:
        return 'Month';
    }
  };

  // Handle quick create modal
  const handleQuickCreate = (date) => {
    setSelectedDate(date);
    setShowQuickCreate(true);
  };

  // Handle close quick create modal
  const handleCloseQuickCreate = () => {
    setShowQuickCreate(false);
    setSelectedDate(null);
  };

  // Custom event renderer for BigCalendar
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderLeft: `4px solid ${event.color}`,
        color: 'white',
      }
    };
  };

  // Determine which view component to render
  const renderViewComponent = () => {
    switch (currentView) {
      case calendarViews.MONTH:
        return (
          <MonthlyView 
            onSelectJob={handleSelectJob}
            onCreateJob={handleQuickCreate}
          />
        );
      case calendarViews.WEEK:
        return (
          <WeeklyView 
            onSelectJob={handleSelectJob}
            onCreateJob={handleQuickCreate}
          />
        );
      case calendarViews.DAY:
        return (
          <DayView 
            onSelectJob={handleSelectJob}
            onCreateJob={handleQuickCreate}
          />
        );
      case calendarViews.AGENDA:
        return (
          <AgendaView 
            onSelectJob={handleSelectJob}
          />
        );
      default:
        return (
          <BigCalendar
            localizer={localizer}
            events={calendarJobs}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 250px)' }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            view={currentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={(view) => handleViewChange(view)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectJob}
            onSelectSlot={({ start }) => handleQuickCreate(start)}
            selectable
          />
        );
    }
  };

  return (
    <div className="calendar-layout">
      <div className="calendar-main">
        <div className="calendar-container">
          {/* Calendar Header */}
          <div className="calendar-header">
            <div className="calendar-navigation">
              <button className="nav-button" onClick={navigatePrevious}>
                <FiChevronLeft size={18} />
              </button>
              <button className="nav-button" onClick={navigateToday}>
                <FiCalendar size={16} className="mr-2" />
                Today
              </button>
              <button className="nav-button" onClick={navigateNext}>
                <FiChevronRight size={18} />
              </button>
              <h2 className="calendar-title">{formatViewTitle()}</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="nav-button"
                onClick={() => setShowFilters(!showFilters)}
                title="Filter calendar"
              >
                <FiFilter size={16} />
              </button>
              
              <button 
                className="nav-button"
                onClick={() => setShowSidebar(!showSidebar)}
                title="Toggle sidebar"
              >
                {showSidebar ? <FiGrid size={16} /> : <FiList size={16} />}
              </button>
              
              <div className="view-controls">
                {Object.values(calendarViews).map((view) => (
                  <button
                    key={view}
                    className={`view-btn ${currentView === view ? 'active' : ''}`}
                    onClick={() => handleViewChange(view)}
                  >
                    {getViewName(view)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Filter Panel (conditional) */}
          {showFilters && <CalendarFilters />}
          
          {/* Calendar View */}
          {renderViewComponent()}
        </div>
      </div>
      
      {/* Calendar Sidebar */}
      {showSidebar && <CalendarSidebar />}
      
      {/* Job Detail Modal */}
      {showJobModal && selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          onClose={handleCloseJobModal}
        />
      )}
      
      {/* Quick Create Modal */}
      {showQuickCreate && (
        <QuickCreateModal 
          date={selectedDate} 
          onClose={handleCloseQuickCreate}
        />
      )}
    </div>
  );
};

export default Calendar; 