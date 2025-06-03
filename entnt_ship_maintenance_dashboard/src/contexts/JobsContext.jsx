import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format } from 'date-fns';

const JobsContext = createContext();

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

// Job Status Workflow Definition
export const statusWorkflow = {
  'pending': ['assigned', 'cancelled'],
  'assigned': ['in-progress', 'on-hold', 'cancelled'],
  'in-progress': ['completed', 'on-hold'],
  'on-hold': ['in-progress', 'cancelled'],
  'completed': [], // Terminal state
  'cancelled': [] // Terminal state
};

// Job Types
export const jobTypes = [
  'routine',
  'repair',
  'inspection',
  'overhaul',
  'emergency'
];

// Job Priorities
export const jobPriorities = [
  'low',
  'medium',
  'high',
  'critical'
];

// Job Statuses
export const jobStatuses = [
  'pending',
  'assigned',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled'
];

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useLocalStorage('jobs', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with mock data if empty
  useEffect(() => {
    if (jobs.length === 0) {
      const currentDate = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(currentDate.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(currentDate.getDate() + 7);

      const mockJobs = [
        {
          id: 'j1',
          jobNumber: 'MJ-2024-001',
          title: 'Engine Oil Change',
          description: 'Regular maintenance inspection and oil change for main engine',
          jobType: 'routine',
          priority: 'medium',
          status: 'pending',
          shipId: 's1',
          componentId: 'c1',
          assignedEngineerId: '3',
          estimatedHours: 4,
          actualHours: 0,
          scheduledDate: format(tomorrow, 'yyyy-MM-dd'),
          startDate: null,
          completionDate: null,
          dueDate: format(nextWeek, 'yyyy-MM-dd'),
          progressPercentage: 0,
          notes: [
            { text: 'Initial job created', author: 'System', date: currentDate.toISOString() }
          ],
          attachments: [],
          createdBy: 'admin',
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString()
        },
        {
          id: 'j2',
          jobNumber: 'MJ-2024-002',
          title: 'Navigation System Inspection',
          description: 'Complete inspection of navigation systems and calibration',
          jobType: 'inspection',
          priority: 'high',
          status: 'assigned',
          shipId: 's2',
          componentId: 'c5',
          assignedEngineerId: '2',
          estimatedHours: 6,
          actualHours: 0,
          scheduledDate: format(currentDate, 'yyyy-MM-dd'),
          startDate: null,
          completionDate: null,
          dueDate: format(tomorrow, 'yyyy-MM-dd'),
          progressPercentage: 0,
          notes: [
            { text: 'Initial job created', author: 'System', date: currentDate.toISOString() },
            { text: 'Assigned to engineer', author: 'Admin', date: currentDate.toISOString() }
          ],
          attachments: [],
          createdBy: 'admin',
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString()
        },
        {
          id: 'j3',
          jobNumber: 'MJ-2024-003',
          title: 'Emergency Hull Repair',
          description: 'Repair damage to hull from recent storm',
          jobType: 'emergency',
          priority: 'critical',
          status: 'in-progress',
          shipId: 's1',
          componentId: 'c3',
          assignedEngineerId: '1',
          estimatedHours: 12,
          actualHours: 4,
          scheduledDate: format(new Date(currentDate.getTime() - 86400000), 'yyyy-MM-dd'), // yesterday
          startDate: format(new Date(currentDate.getTime() - 86400000), 'yyyy-MM-dd'),
          completionDate: null,
          dueDate: format(currentDate, 'yyyy-MM-dd'),
          progressPercentage: 35,
          notes: [
            { text: 'Initial job created', author: 'System', date: new Date(currentDate.getTime() - 86400000).toISOString() },
            { text: 'Started repair work', author: 'Engineer', date: new Date(currentDate.getTime() - 86400000).toISOString() },
            { text: 'Additional materials needed', author: 'Engineer', date: currentDate.toISOString() }
          ],
          attachments: [
            { name: 'damage-report.pdf', url: '#', uploadedBy: 'admin', date: new Date(currentDate.getTime() - 86400000).toISOString() }
          ],
          createdBy: 'admin',
          createdAt: new Date(currentDate.getTime() - 86400000).toISOString(),
          updatedAt: currentDate.toISOString()
        }
      ];
      setJobs(mockJobs);
    }
  }, []);

  // Generate a new job number
  const generateJobNumber = () => {
    const year = new Date().getFullYear();
    const existingJobsThisYear = jobs.filter(job => job.jobNumber.includes(`MJ-${year}`));
    const nextNumber = existingJobsThisYear.length + 1;
    return `MJ-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const addJob = async (jobData) => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const newJob = {
        ...jobData,
        id: `j${Date.now()}`,
        jobNumber: generateJobNumber(),
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
        notes: [
          { text: 'Initial job created', author: jobData.createdBy || 'System', date: currentDate.toISOString() }
        ],
        attachments: jobData.attachments || []
      };
      setJobs(prev => [...prev, newJob]);
      return newJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      setLoading(true);
      setJobs(prev => prev.map(job => 
        job.id === id 
          ? { ...job, ...jobData, updatedAt: new Date().toISOString() }
          : job
      ));
      return getJobById(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (id, newStatus, note, progressPercentage = null) => {
    try {
      setLoading(true);
      const job = getJobById(id);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Validate status transition
      const allowedTransitions = statusWorkflow[job.status] || [];
      if (!allowedTransitions.includes(newStatus)) {
        throw new Error(`Cannot transition from ${job.status} to ${newStatus}`);
      }
      
      const currentDate = new Date();
      const updateData = {
        status: newStatus,
        updatedAt: currentDate.toISOString(),
        notes: [
          ...job.notes,
          { 
            text: note || `Status updated to ${newStatus}`, 
            author: 'System', 
            date: currentDate.toISOString() 
          }
        ]
      };
      
      // Update specific fields based on status
      if (newStatus === 'in-progress' && !job.startDate) {
        updateData.startDate = currentDate.toISOString();
      } else if (newStatus === 'completed' && !job.completionDate) {
        updateData.completionDate = currentDate.toISOString();
      }
      
      // Update progress percentage if provided
      if (progressPercentage !== null) {
        updateData.progressPercentage = progressPercentage;
      }
      
      return await updateJob(id, updateData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addJobNote = async (id, noteText, author) => {
    try {
      setLoading(true);
      const job = getJobById(id);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      const newNote = {
        text: noteText,
        author: author || 'System',
        date: new Date().toISOString()
      };
      
      return await updateJob(id, {
        notes: [...job.notes, newNote]
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addJobAttachment = async (id, attachment) => {
    try {
      setLoading(true);
      const job = getJobById(id);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      return await updateJob(id, {
        attachments: [...job.attachments, {
          ...attachment,
          date: new Date().toISOString()
        }]
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    try {
      setLoading(true);
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id) => {
    return jobs.find(job => job.id === id);
  };

  const getJobsByShip = (shipId) => {
    return jobs.filter(job => job.shipId === shipId);
  };

  const getJobsByComponent = (componentId) => {
    return jobs.filter(job => job.componentId === componentId);
  };

  const getJobsByEngineer = (engineerId) => {
    return jobs.filter(job => job.assignedEngineerId === engineerId);
  };

  const getJobsByStatus = (status) => {
    return jobs.filter(job => job.status === status);
  };

  const getJobsByPriority = (priority) => {
    return jobs.filter(job => job.priority === priority);
  };

  const getJobsByType = (jobType) => {
    return jobs.filter(job => job.jobType === jobType);
  };

  const getOverdueJobs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return jobs.filter(job => {
      if (job.status === 'completed' || job.status === 'cancelled') {
        return false;
      }
      
      const dueDate = new Date(job.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });
  };

  const getJobsDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return jobs.filter(job => {
      if (job.status === 'completed' || job.status === 'cancelled') {
        return false;
      }
      
      const dueDate = new Date(job.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() === today.getTime();
    });
  };

  const getJobsCompletedThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return jobs.filter(job => {
      if (job.status !== 'completed' || !job.completionDate) {
        return false;
      }
      
      const completionDate = new Date(job.completionDate);
      return completionDate >= firstDayOfMonth;
    });
  };

  const value = {
    jobs,
    loading,
    error,
    jobTypes,
    jobPriorities,
    jobStatuses,
    statusWorkflow,
    addJob,
    updateJob,
    updateJobStatus,
    addJobNote,
    addJobAttachment,
    deleteJob,
    getJobById,
    getJobsByShip,
    getJobsByComponent,
    getJobsByEngineer,
    getJobsByStatus,
    getJobsByPriority,
    getJobsByType,
    getOverdueJobs,
    getJobsDueToday,
    getJobsCompletedThisMonth
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}; 