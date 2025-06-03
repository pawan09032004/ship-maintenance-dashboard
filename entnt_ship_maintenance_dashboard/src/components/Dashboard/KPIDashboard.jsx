import { FiAnchor, FiAlertTriangle, FiClock, FiCheckCircle } from 'react-icons/fi';
import KPICard from './KPICard';
import KPICharts from './KPICharts';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { useJobs } from '../../contexts/JobsContext';
import './KPIStyles.css';

const KPIDashboard = () => {
  // Get data from contexts
  const { ships } = useShips();
  const { components } = useComponents();
  const { jobs } = useJobs();
  
  // Calculate KPI values from real data
  const totalShips = ships.length;
  const jobsInProgress = jobs.filter(job => job.status === 'In Progress').length;
  const jobsCompleted = jobs.filter(job => job.status === 'Completed').length;
  const overdueComponents = components.filter(component => {
    const lastMaintenance = new Date(component.lastMaintenanceDate);
    const today = new Date();
    const monthsSinceLastMaintenance = (today - lastMaintenance) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceLastMaintenance > 6; // Consider overdue if more than 6 months
  }).length;
  
  // Prepare data for job status chart
  const jobStatusData = [
    { name: 'In Progress', value: jobsInProgress, color: '#F59E0B' },
    { name: 'Completed', value: jobsCompleted, color: '#10B981' },
    { name: 'Pending', value: jobs.length - (jobsInProgress + jobsCompleted), color: '#6B7280' }
  ];
  
  // Prepare data for maintenance chart
  // Group components by type and count overdue ones
  const maintenanceData = [];
  const componentTypes = {};
  
  components.forEach(component => {
    const lastMaintenance = new Date(component.lastMaintenanceDate);
    const today = new Date();
    const monthsSinceLastMaintenance = (today - lastMaintenance) / (1000 * 60 * 60 * 24 * 30);
    const isOverdue = monthsSinceLastMaintenance > 6;
    
    if (!componentTypes[component.type]) {
      componentTypes[component.type] = { total: 0, overdue: 0 };
    }
    
    componentTypes[component.type].total += 1;
    if (isOverdue) {
      componentTypes[component.type].overdue += 1;
    }
  });
  
  // Convert to array format for the chart
  Object.keys(componentTypes).forEach(type => {
    maintenanceData.push({
      category: type,
      overdue: componentTypes[type].overdue
    });
  });
  
  // Sort by number of overdue components
  maintenanceData.sort((a, b) => b.overdue - a.overdue);
  
  // If no real data is available, use mock data
  const useMockData = maintenanceData.length === 0;
  
  // Mock data for maintenance chart
  const mockMaintenanceData = [
    { category: 'Engine', overdue: 3 },
    { category: 'Hull', overdue: 2 },
    { category: 'Navigation', overdue: 3 },
    { category: 'Electrical', overdue: 1 },
    { category: 'Propulsion', overdue: 2 }
  ];
  
  // Mock data for jobs completed over time
  const jobsCompletedData = [
    { month: 'Jan', completed: 12 },
    { month: 'Feb', completed: 19 },
    { month: 'Mar', completed: 15 },
    { month: 'Apr', completed: 21 },
    { month: 'May', completed: 28 },
    { month: 'Jun', completed: 24 },
    { month: 'Jul', completed: 32 }
  ];
  
  return (
    <div className="kpi-dashboard">
      <h2 className="kpi-section-title">Performance Metrics</h2>
      
      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <KPICard 
          title="Total Ships"
          value={totalShips || 24}
          icon={<FiAnchor size={22} />}
          color="blue"
          change={8}
          changeType="increase"
          description="Total ships in the fleet"
        />
        
        <KPICard 
          title="Overdue Maintenance"
          value={overdueComponents || 8}
          icon={<FiAlertTriangle size={22} />}
          color="red"
          change={12}
          changeType="increase"
          description="Components requiring immediate attention"
        />
        
        <KPICard 
          title="Jobs in Progress"
          value={jobsInProgress || 12}
          icon={<FiClock size={22} />}
          color="amber"
          change={5}
          changeType="decrease"
          description="Active maintenance jobs"
        />
        
        <KPICard 
          title="Jobs Completed"
          value={jobsCompleted || 156}
          icon={<FiCheckCircle size={22} />}
          color="green"
          change={23}
          changeType="increase"
          description="Successfully completed maintenance"
        />
      </div>
      
      {/* Charts */}
      <KPICharts 
        jobStatusData={jobStatusData.length > 0 ? jobStatusData : [
          { name: 'In Progress', value: 12, color: '#F59E0B' },
          { name: 'Completed', value: 156, color: '#10B981' },
          { name: 'Pending', value: 8, color: '#6B7280' }
        ]}
        maintenanceData={useMockData ? mockMaintenanceData : maintenanceData}
        jobsCompletedData={jobsCompletedData}
      />
    </div>
  );
};

export default KPIDashboard; 