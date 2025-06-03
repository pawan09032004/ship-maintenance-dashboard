import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../contexts/JobsContext';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';

const QuickCreateModal = ({ date, onClose }) => {
  const navigate = useNavigate();
  const { addJob, jobTypes, jobPriorities } = useJobs();
  const { ships } = useShips();
  const { components } = useComponents();
  
  // Format date for display
  const formattedDate = format(date, 'yyyy-MM-dd');
  const formattedTime = format(date, 'HH:mm');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shipId: '',
    componentId: '',
    jobType: 'routine',
    priority: 'medium',
    description: '',
    estimatedHours: 2,
    scheduledDate: formattedDate,
    scheduledTime: formattedTime,
    assignedEngineerId: '',
  });
  
  // Selected priority
  const [selectedPriority, setSelectedPriority] = useState('medium');
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle priority selection
  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    if (!formData.title.trim()) {
      validationErrors.title = 'Job title is required';
    }
    if (!formData.shipId) {
      validationErrors.shipId = 'Ship is required';
    }
    
    // If we have errors, set them and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      // Format the datetime for the job
      const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Prepare job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        jobType: formData.jobType,
        priority: formData.priority,
        status: 'pending',
        shipId: formData.shipId,
        componentId: formData.componentId || null,
        assignedEngineerId: formData.assignedEngineerId || null,
        estimatedHours: Number(formData.estimatedHours),
        scheduledDate: format(dateTime, 'yyyy-MM-dd'),
        startDate: null,
        completionDate: null,
        dueDate: format(dateTime, 'yyyy-MM-dd'), // Default due date same as scheduled
        progressPercentage: 0,
        createdBy: 'user', // This should come from auth context
      };
      
      // Add the job
      const newJob = await addJob(jobData);
      
      // Close the modal
      onClose();
      
      // Navigate to the job details page
      navigate(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      setErrors({
        submit: 'Failed to create job. Please try again.'
      });
    }
  };
  
  // Get filtered components based on selected ship
  const filteredComponents = formData.shipId
    ? components.filter(comp => comp.shipId === formData.shipId)
    : [];
  
  return (
    <div className="quick-create-modal">
      <div className="flex justify-between items-center mb-4">
        <h3>Quick Schedule Job</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
      </div>
      
      <form className="quick-form" onSubmit={handleSubmit}>
        {/* Job Title */}
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter job title..."
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        {/* Ship and Component */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shipId">Ship</label>
            <select
              id="shipId"
              name="shipId"
              value={formData.shipId}
              onChange={handleChange}
              className={errors.shipId ? 'error' : ''}
            >
              <option value="">Select Ship</option>
              {ships.map(ship => (
                <option key={ship.id} value={ship.id}>{ship.name}</option>
              ))}
            </select>
            {errors.shipId && <span className="error-message">{errors.shipId}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="componentId">Component (Optional)</label>
            <select
              id="componentId"
              name="componentId"
              value={formData.componentId}
              onChange={handleChange}
              disabled={!formData.shipId}
            >
              <option value="">Select Component</option>
              {filteredComponents.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Date and Time */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduledDate">Date</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="scheduledTime">Time</label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
            />
          </div>
        </div>
        
        {/* Job Type and Estimated Hours */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jobType">Job Type</label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="estimatedHours">Estimated Hours</label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0.5"
              step="0.5"
            />
          </div>
        </div>
        
        {/* Priority Buttons */}
        <div className="form-group">
          <label>Priority</label>
          <div className="priority-buttons">
            {jobPriorities.map(priority => (
              <button
                key={priority}
                type="button"
                className={`priority-btn ${priority} ${selectedPriority === priority ? 'active' : ''}`}
                onClick={() => handlePrioritySelect(priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Enter job description..."
          ></textarea>
        </div>
        
        {/* Engineer */}
        <div className="form-group">
          <label htmlFor="assignedEngineerId">Assign Engineer (Optional)</label>
          <select
            id="assignedEngineerId"
            name="assignedEngineerId"
            value={formData.assignedEngineerId}
            onChange={handleChange}
          >
            <option value="">Select Engineer</option>
            <option value="1">John Smith</option>
            <option value="2">Maria Rodriguez</option>
            <option value="3">David Chen</option>
          </select>
        </div>
        
        {/* Submit Error */}
        {errors.submit && (
          <div className="error-message mb-4">{errors.submit}</div>
        )}
        
        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Schedule Job
          </button>
        </div>
      </form>
    </div>
  );
};

QuickCreateModal.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onClose: PropTypes.func.isRequired
};

export default QuickCreateModal; 