import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../../contexts/JobsContext';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiFileText, FiMessageSquare, FiUpload, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, deleteJob, updateJobStatus, addJobNote, statusWorkflow } = useJobs();
  const { ships } = useShips();
  const { components } = useComponents();
  
  const [activeTab, setActiveTab] = useState('details');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [newNote, setNewNote] = useState('');

  const job = getJobById(id);
  const ship = job ? ships.find(s => s.id === job.shipId) : null;
  const component = job ? components.find(c => c.id === job.componentId) : null;

  if (!job || !ship || !component) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#111827]">Job not found</h2>
            <Link to="/jobs" className="mt-4 text-primary-600 hover:text-primary-500">
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        navigate('/jobs');
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Failed to delete job:', error);
        toast.error('Failed to delete job');
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateJobStatus(id, newStatus, statusNote, progressPercentage);
      setShowStatusModal(false);
      setStatusNote('');
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update job status:', error);
      toast.error(error.message || 'Failed to update job status');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addJobNote(id, newNote, 'Admin');
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--status-pending)';
      case 'assigned': return 'var(--status-assigned)';
      case 'in-progress': return 'var(--status-progress)';
      case 'on-hold': return 'var(--status-hold)';
      case 'completed': return 'var(--status-completed)';
      case 'cancelled': return 'var(--status-cancelled)';
      default: return 'var(--status-pending)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'var(--priority-low)';
      case 'medium': return 'var(--priority-medium)';
      case 'high': return 'var(--priority-high)';
      case 'critical': return 'var(--priority-critical)';
      default: return 'var(--priority-medium)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const allowedTransitions = statusWorkflow[job.status] || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="job-detail-header" style={{ borderColor: getPriorityColor(job.priority) }}>
          <div className="job-detail-title-row">
            <h1 className="job-detail-title">{job.title}</h1>
            <div className="job-detail-actions">
              <button
                onClick={() => {
                  if (allowedTransitions.length > 0) {
                    setNewStatus(allowedTransitions[0]);
                    setProgressPercentage(job.progressPercentage || 0);
                    setShowStatusModal(true);
                  } else {
                    toast.error('No status transitions available');
                  }
                }}
              className="btn btn-primary"
                disabled={allowedTransitions.length === 0}
            >
                Update Status
              </button>
              <Link to={`/jobs/${id}/edit`} className="btn btn-secondary">
              Edit Job
            </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>

          <div className="job-detail-meta">
            <div className="job-detail-meta-item">
              <span className="job-detail-meta-label">Job Number</span>
              <span className="job-detail-meta-value">{job.jobNumber}</span>
            </div>
            <div className="job-detail-meta-item">
              <span className="job-detail-meta-label">Ship</span>
              <Link to={`/ships/${ship.id}`} className="job-detail-meta-value text-blue-600 hover:underline">
                {ship.name}
              </Link>
            </div>
            <div className="job-detail-meta-item">
              <span className="job-detail-meta-label">Component</span>
              <Link to={`/components/${component.id}`} className="job-detail-meta-value text-blue-600 hover:underline">
                {component.name}
              </Link>
            </div>
            <div className="job-detail-meta-item">
              <span className="job-detail-meta-label">Status</span>
              <span 
                className="job-detail-meta-value status-badge"
                style={{ backgroundColor: getStatusColor(job.status) }}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <div className="job-detail-meta-item">
              <span className="job-detail-meta-label">Priority</span>
              <span 
                className="job-detail-meta-value priority-badge"
                style={{ backgroundColor: getPriorityColor(job.priority) }}
              >
                {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${job.progressPercentage}%`,
                backgroundColor: getStatusColor(job.status)
              }}
            ></div>
          </div>
          <span className="progress-text">{job.progressPercentage}% Complete</span>
        </div>

        {/* Tabs */}
        <div className="job-tabs">
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button 
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({job.notes?.length || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Files ({job.attachments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-4">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dl className="grid grid-cols-3 gap-4">
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Job Type</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{job.createdBy}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Created Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.createdAt)}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.updatedAt)}</dd>
                    </dl>
                  </div>
                  <div>
                    <dl className="grid grid-cols-3 gap-4">
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Scheduled Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.scheduledDate)}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Due Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.dueDate)}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.startDate)}</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Completion Date</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{formatDate(job.completionDate)}</dd>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-4">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Tracking</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{job.progressPercentage}%</span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-4 rounded-full" 
                      style={{ 
                        width: `${job.progressPercentage}%`,
                        backgroundColor: getStatusColor(job.status)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Time Tracking</h4>
                    <dl className="grid grid-cols-3 gap-4">
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Estimated Hours</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{job.estimatedHours} hours</dd>
                      
                      <dt className="col-span-1 text-sm font-medium text-gray-500">Actual Hours</dt>
                      <dd className="col-span-2 text-sm text-gray-900">{job.actualHours} hours</dd>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Status History</h4>
                    <div className="space-y-3">
                      {job.notes
                        .filter(note => note.text.includes('Status updated to'))
                        .map((note, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiClock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{note.text}</p>
                              <p className="text-xs text-gray-500">
                                {note.author} - {format(new Date(note.date), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-4">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes & Updates</h3>
                
                <div className="mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="min-w-0 flex-1">
                      <div className="relative">
                        <textarea
                          rows={3}
                          className="input"
                          placeholder="Add a note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flow-root">
                  <ul className="-mb-8">
                    {job.notes.map((note, noteIdx) => (
                      <li key={noteIdx}>
                        <div className="relative pb-8">
                          {noteIdx !== job.notes.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                <FiMessageSquare className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">{note.author}</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {format(new Date(note.date), 'MMM dd, yyyy HH:mm')}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{note.text}</p>
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
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-4">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments & Files</h3>
                
                <div className="mb-6">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
                
                {job.attachments.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No files attached to this job yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {job.attachments.map((file, index) => (
                      <li key={index} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded by {file.uploadedBy} on {format(new Date(file.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div>
                          <a
                            href={file.url}
                            download
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            <FiDownload className="h-5 w-5" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Job Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Status</label>
                <select
                  className="input mt-1"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {allowedTransitions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {newStatus === 'in-progress' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Progress Percentage</label>
                  <div className="flex items-center mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressPercentage}
                      onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm text-gray-700">{progressPercentage}%</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Note</label>
                <textarea
                  rows={3}
                  className="input mt-1"
                  placeholder="Add details about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStatusChange}
              >
                Update Status
              </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails; 