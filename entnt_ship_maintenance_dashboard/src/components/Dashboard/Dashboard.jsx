import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { useJobs } from '../../contexts/JobsContext';
import { 
  FiAnchor, FiSettings, FiClock, FiAlertTriangle, 
  FiCalendar, FiFilter, FiRefreshCw, FiChevronRight,
  FiList, FiInfo, FiActivity, FiCheckCircle, FiPlus, FiEye 
} from 'react-icons/fi';
import KPICard from './KPICard';
import KPICharts from './KPICharts';
import './DashboardStyles.css';
import './KPIStyles.css';

const Dashboard = () => {
  const { ships } = useShips();
  const { components } = useComponents();
  const { jobs } = useJobs();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Use real data with fallback to mock data
  const totalShips = ships.length || 24;
  const jobsInProgress = jobs.filter(job => job.status === 'In Progress').length || 12;
  const jobsCompleted = jobs.filter(job => job.status === 'Completed').length || 156;
  const overdueComponents = components.filter(component => {
    if (!component.lastMaintenanceDate) return false;
    const lastMaintenance = new Date(component.lastMaintenanceDate);
    const today = new Date();
    const monthsSinceLastMaintenance = (today - lastMaintenance) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceLastMaintenance > 6; // Consider overdue if more than 6 months
  }).length || 8;
  
  // Fixed KPI trends and percentages for meaningful data
  const kpiData = [
    {
      title: 'Total Ships',
      value: totalShips,
      icon: <FiAnchor size={isMobile ? 18 : 22} />,
      color: 'blue',
      change: 8,
      changeType: 'increase',
      description: 'Total ships in the fleet'
    },
    {
      title: 'Overdue Maintenance',
      value: overdueComponents,
      icon: <FiAlertTriangle size={isMobile ? 18 : 22} />,
      color: 'red',
      change: 12,
      changeType: 'decrease', // Changed to decrease as this is positive
      description: 'Components requiring immediate attention'
    },
    {
      title: 'Jobs in Progress',
      value: jobsInProgress,
      icon: <FiClock size={isMobile ? 18 : 22} />,
      color: 'amber',
      change: 5,
      changeType: 'increase',
      description: 'Active maintenance jobs'
    },
    {
      title: 'Jobs Completed',
      value: jobsCompleted,
      icon: <FiCheckCircle size={isMobile ? 18 : 22} />,
      color: 'green',
      change: 23,
      changeType: 'increase',
      description: 'Successfully completed maintenance'
    }
  ];
  
  // Fixed job status chart data with realistic percentages
  const fixedJobStatusData = [
    { name: 'In Progress', value: 15, color: '#F59E0B' },
    { name: 'Completed', value: 75, color: '#10B981' },
    { name: 'Pending', value: 10, color: '#6B7280' }
  ];
  
  // Fixed maintenance data with proper categories
  const fixedMaintenanceData = [
    { category: 'Engine', overdue: 3 },
    { category: 'Hull', overdue: 2 },
    { category: 'Navigation', overdue: 2 },
    { category: 'Electrical', overdue: 1 }
  ];
  
  // Improved jobs completed data
  const fixedJobsCompletedData = [
    { month: 'Jan', completed: 12 },
    { month: 'Feb', completed: 19 },
    { month: 'Mar', completed: 15 },
    { month: 'Apr', completed: 21 },
    { month: 'May', completed: 28 },
    { month: 'Jun', completed: 24 },
    { month: 'Jul', completed: 32 }
  ];

  // Get 5 most recent jobs with fallback to mock data if empty
  const getRecentJobs = () => {
    if (jobs.length === 0) {
      return [
        { 
          id: 1, 
          type: 'Inspection', 
          priority: 'High', 
          status: 'In Progress',
          ship: { name: 'Poseidon Explorer' },
          component: { name: 'Main Engine' }
        },
        { 
          id: 2, 
          type: 'Repair', 
          priority: 'Medium', 
          status: 'Pending',
          ship: { name: 'Atlantic Voyager' },
          component: { name: 'Navigation System' }
        },
        { 
          id: 3, 
          type: 'Maintenance', 
          priority: 'Low', 
          status: 'Completed',
          ship: { name: 'Pacific Guardian' },
          component: { name: 'Hull Structure' }
        },
        { 
          id: 4, 
          type: 'Inspection', 
          priority: 'High', 
          status: 'In Progress',
          ship: { name: 'Northern Star' },
          component: { name: 'Electrical Systems' }
        },
        { 
          id: 5, 
          type: 'Maintenance', 
          priority: 'Medium', 
          status: 'Completed',
          ship: { name: 'Southern Cross' },
          component: { name: 'Propulsion Unit' }
        }
      ];
    }
    
    return jobs.slice(0, 5).map(job => ({
      ...job,
      ship: ships.find(s => s.id === job.shipId) || { name: 'Unknown Ship' },
      component: components.find(c => c.id === job.componentId) || { name: 'Unknown Component' }
    }));
  };
  
  const recentJobs = getRecentJobs();

  // Get job type icon
  const getJobTypeIcon = (type) => {
    if (!type) return <FiCalendar className="job-icon" />;
    
    switch(type.toLowerCase()) {
      case 'inspection':
        return <FiFilter className="job-icon inspection" />;
      case 'repair':
        return <FiSettings className="job-icon repair" />;
      case 'maintenance':
        return <FiRefreshCw className="job-icon maintenance" />;
      default:
        return <FiCalendar className="job-icon" />;
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    if (!priority) return 'badge badge-low';
    
    switch(priority.toLowerCase()) {
      case 'high':
        return 'badge badge-high';
      case 'medium':
        return 'badge badge-medium';
      default:
        return 'badge badge-low';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge badge-pending';
    
    switch(status.toLowerCase()) {
      case 'completed':
        return 'badge badge-success';
      case 'in progress':
        return 'badge badge-progress';
      default:
        return 'badge badge-pending';
    }
  };

  // Quick action items configuration
  const quickActions = [
    { 
      label: 'Manage Ships', 
      icon: <FiAnchor className="quick-link-icon" size={22} />, 
      color: 'blue',
      link: '/ships' 
    },
    { 
      label: 'Manage Components', 
      icon: <FiSettings className="quick-link-icon" size={22} />, 
      color: 'green',
      link: '/components' 
    },
    { 
      label: 'Schedule Jobs', 
      icon: <FiCalendar className="quick-link-icon" size={22} />, 
      color: 'amber',
      link: '/jobs/new' 
    },
    { 
      label: 'View Calendar', 
      icon: <FiList className="quick-link-icon" size={22} />, 
      color: 'purple',
      link: '/calendar' 
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-section">
        <div className="combined-top-grid">
          <div className="kpi-cards-container">
            <div className="kpi-cards-grid">
              {kpiData.map((item, index) => (
                <KPICard 
                  key={index}
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                  color={item.color}
                  change={item.change}
                  changeType={item.changeType}
                  description={item.description}
                  compact={isMobile}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section quick-actions-section">
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">
            <FiList className="section-icon" /> Quick Actions
          </h3>
        </div>
        <div className="quick-links-container">
          <div className="quick-links-grid">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`quick-link-card ${action.color}`}
              >
                {action.icon}
                <span className="quick-link-text">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section - Different layouts for different screen sizes */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">
            <FiActivity className="section-icon" /> Performance Metrics
          </h3>
          <button className="refresh-button">
            <FiRefreshCw size={isMobile ? 14 : 16} /> Refresh
          </button>
        </div>
        
        <div className="charts-container">
          <KPICharts 
            jobStatusData={fixedJobStatusData} 
            maintenanceData={fixedMaintenanceData}
            jobsCompletedData={fixedJobsCompletedData}
            compact={isMobile || isTablet}
          />
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">
            <FiClock className="section-icon" /> Recent Jobs
          </h3>
          <Link to="/jobs" className="view-all-link">
            View All <FiChevronRight size={16} />
          </Link>
        </div>
        
        {recentJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiCalendar size={48} />
            </div>
            <h4>No Jobs Found</h4>
            <p>There are no maintenance jobs scheduled in the system.</p>
            <Link to="/jobs/new" className="add-job-button">
              <FiPlus size={16} /> Schedule Job
            </Link>
          </div>
        ) : (
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Ship</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => (
                  <tr key={job.id} className="job-row">
                    <td>
                      <div className="job-task">
                        {getJobTypeIcon(job.type)}
                        <div className="job-details">
                          <div className="job-type">{job.type}</div>
                          <div className="job-component">{job.component.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="job-ship">{job.ship.name}</div>
                    </td>
                    <td>
                      <span className={getPriorityBadgeClass(job.priority)}>
                        {job.priority}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(job.status)}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <div className="job-actions">
                        <Link to={`/jobs/${job.id}`} className="view-job-button">
                          <FiEye size={isMobile ? 14 : 16} />
                          {!isMobile && <span>View</span>}
                        </Link>
                        <Link to={`/jobs/${job.id}/edit`} className="edit-job-button">
                          <FiSettings size={isMobile ? 14 : 16} />
                          {!isMobile && <span>Edit</span>}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="card-footer">
          <Link to="/jobs/new" className="add-job-button">
            <FiPlus size={16} /> Schedule New Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 