import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../contexts/JobsContext';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { format } from 'date-fns';
import { 
  FiAlertTriangle, FiCalendar, FiClock, FiTool, 
  FiCheckCircle, FiActivity, FiUsers, FiBarChart2,
  FiArrowRight, FiPlus
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, 
  Cell, LineChart, Line
} from 'recharts';

const JobsDashboard = () => {
  const { 
    jobs, 
    getOverdueJobs, 
    getJobsDueToday, 
    getJobsCompletedThisMonth, 
    getJobsByStatus 
  } = useJobs();
  const { ships } = useShips();
  const { components } = useComponents();

  const overdueJobs = getOverdueJobs();
  const jobsDueToday = getJobsDueToday();
  const completedThisMonth = getJobsCompletedThisMonth();
  const pendingJobs = getJobsByStatus('pending');
  const inProgressJobs = getJobsByStatus('in-progress');
  const completedJobs = getJobsByStatus('completed');

  // Calculate statistics
  const totalJobs = jobs.length;
  const completionRate = totalJobs > 0 
    ? Math.round((completedJobs.length / totalJobs) * 100) 
    : 0;

  // Chart data
  const statusData = [
    { name: 'Pending', value: pendingJobs.length, color: 'var(--status-pending)' },
    { name: 'Assigned', value: getJobsByStatus('assigned').length, color: 'var(--status-assigned)' },
    { name: 'In Progress', value: inProgressJobs.length, color: 'var(--status-progress)' },
    { name: 'On Hold', value: getJobsByStatus('on-hold').length, color: 'var(--status-hold)' },
    { name: 'Completed', value: completedJobs.length, color: 'var(--status-completed)' },
    { name: 'Cancelled', value: getJobsByStatus('cancelled').length, color: 'var(--status-cancelled)' }
  ];

  const priorityData = [
    { name: 'Low', value: jobs.filter(job => job.priority === 'low').length, color: 'var(--priority-low)' },
    { name: 'Medium', value: jobs.filter(job => job.priority === 'medium').length, color: 'var(--priority-medium)' },
    { name: 'High', value: jobs.filter(job => job.priority === 'high').length, color: 'var(--priority-high)' },
    { name: 'Critical', value: jobs.filter(job => job.priority === 'critical').length, color: 'var(--priority-critical)' }
  ];

  // Engineer workload data
  const engineerWorkload = [
    { name: 'John Smith', assigned: jobs.filter(job => job.assignedEngineerId === '1').length, capacity: 10 },
    { name: 'Maria Rodriguez', assigned: jobs.filter(job => job.assignedEngineerId === '2').length, capacity: 8 },
    { name: 'David Chen', assigned: jobs.filter(job => job.assignedEngineerId === '3').length, capacity: 12 }
  ];

  // Recent activity - last 5 updated jobs
  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#111827]">Maintenance Dashboard</h1>
          <Link to="/jobs/new" className="btn btn-primary">
            <FiPlus className="mr-2" />
            Create New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: 'var(--status-progress)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{inProgressJobs.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <FiActivity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  {Math.round((inProgressJobs.length / totalJobs) * 100) || 0}% of total
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: 'var(--priority-critical)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Jobs</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{overdueJobs.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <FiAlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  {overdueJobs.length > 0 ? 'Requires immediate attention' : 'No overdue jobs'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: 'var(--status-completed)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed This Month</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{completedThisMonth.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FiCheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  {completionRate}% completion rate
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: 'var(--priority-medium)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Due Today</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{jobsDueToday.length}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <FiCalendar className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  {jobsDueToday.length > 0 ? 'Scheduled for today' : 'No jobs due today'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Queue */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Priority Queue</h2>
          </div>
          <div className="p-6">
            {jobs.filter(job => job.priority === 'critical' || job.priority === 'high')
              .filter(job => job.status !== 'completed' && job.status !== 'cancelled')
              .sort((a, b) => {
                if (a.priority === 'critical' && b.priority !== 'critical') return -1;
                if (a.priority !== 'critical' && b.priority === 'critical') return 1;
                return new Date(a.dueDate) - new Date(b.dueDate);
              })
              .slice(0, 5)
              .map(job => (
                <div key={job.id} className="mb-4 last:mb-0">
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: '4px', borderLeftColor: job.priority === 'critical' ? 'var(--priority-critical)' : 'var(--priority-high)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.jobNumber}</p>
                      </div>
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: job.priority === 'critical' ? 'var(--priority-critical)' : 'var(--priority-high)',
                          color: 'white'
                        }}
                      >
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1.5 h-4 w-4" />
                      Due: {format(new Date(job.dueDate), 'MMM dd, yyyy')}
                      {new Date(job.dueDate) < new Date() && (
                        <span className="ml-2 text-red-500 font-medium">Overdue</span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            {jobs.filter(job => job.priority === 'critical' || job.priority === 'high')
              .filter(job => job.status !== 'completed' && job.status !== 'cancelled').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No high priority jobs at the moment
              </div>
            )}
            <div className="mt-4 text-right">
              <Link to="/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-end">
                View all jobs <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Job Status Distribution</h2>
            </div>
            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engineer Workload */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Engineer Workload</h2>
            </div>
            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engineerWorkload}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="assigned" name="Assigned Jobs" fill="var(--status-assigned)" />
                  <Bar dataKey="capacity" name="Capacity" fill="var(--color-gray-300)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((job, jobIdx) => (
                  <li key={job.id}>
                    <div className="relative pb-8">
                      {jobIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                            style={{ backgroundColor: job.status === 'completed' 
                              ? 'var(--status-completed)' 
                              : job.status === 'in-progress' 
                                ? 'var(--status-progress)' 
                                : 'var(--color-gray-400)' 
                            }}
                          >
                            <FiTool className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <Link to={`/jobs/${job.id}`} className="font-medium text-gray-900">
                                {job.title}
                              </Link>
                              {' - '}
                              <span className="font-medium">
                                Status: {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={job.updatedAt}>
                              {format(new Date(job.updatedAt), 'MMM dd, HH:mm')}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsDashboard; 