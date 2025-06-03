import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useJobs } from '../../contexts/JobsContext';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiX, FiUpload, FiCalendar, FiClock, FiAlertTriangle, 
  FiFileText, FiCheckCircle, FiArrowLeft, FiArrowRight, FiSave, 
  FiTool, FiAnchor, FiSettings, FiCheck
} from 'react-icons/fi';
import '../Ships/ShipsStyles.css';
import './JobsStyles.css';

// Demo components if needed
const demoComponents = [
  {
    id: 'c1',
    name: 'Main Engine',
    category: 'Engine',
    shipId: 's1',
    description: 'MAN B&W 11G90ME-C10.5 Two-stroke diesel engine',
    status: 'operational',
    serialNumber: 'ME-2358-9041',
    manufacturer: 'MAN Energy Solutions',
    modelNumber: '11G90ME-C10.5',
    installationDate: '2018-05-15',
    lastMaintenanceDate: '2023-06-10'
  },
  {
    id: 'c2',
    name: 'Auxiliary Engine 1',
    category: 'Engine',
    shipId: 's1',
    description: 'Wärtsilä 8L20 Four-stroke diesel generator',
    status: 'needs_maintenance',
    serialNumber: 'AE-4781-1020',
    manufacturer: 'Wärtsilä',
    modelNumber: '8L20',
    installationDate: '2018-05-20',
    lastMaintenanceDate: '2023-03-15'
  },
  {
    id: 'c3',
    name: 'Hull Structure',
    category: 'Hull',
    shipId: 's1',
    description: 'Double hull steel construction',
    status: 'operational',
    serialNumber: 'N/A',
    manufacturer: 'Hyundai Heavy Industries',
    installationDate: '2018-01-10',
    lastMaintenanceDate: '2023-05-02'
  },
  {
    id: 'c4',
    name: 'Navigation Radar',
    category: 'Navigation',
    shipId: 's2',
    description: 'JRC JMA-9172-SA X-band radar system',
    status: 'operational',
    serialNumber: 'NR-2021-5873',
    manufacturer: 'Japan Radio Company',
    modelNumber: 'JMA-9172-SA',
    installationDate: '2015-03-15',
    lastMaintenanceDate: '2023-07-18'
  },
  {
    id: 'c5',
    name: 'GPS System',
    category: 'Navigation',
    shipId: 's2',
    description: 'Furuno GP-170 GPS Navigator',
    status: 'operational',
    serialNumber: 'GPS-1722-9945',
    manufacturer: 'Furuno',
    modelNumber: 'GP-170',
    installationDate: '2015-03-16',
    lastMaintenanceDate: '2023-07-18'
  },
  {
    id: 'c6',
    name: 'Ballast Water System',
    category: 'Machinery',
    shipId: 's3',
    description: 'Ballast water treatment system',
    status: 'operational',
    serialNumber: 'BWT-3358-1071',
    manufacturer: 'Alfa Laval',
    modelNumber: 'PureBallast 3.1',
    installationDate: '2019-02-25',
    lastMaintenanceDate: '2023-08-05'
  },
  {
    id: 'c7',
    name: 'Main Cargo Pump',
    category: 'Machinery',
    shipId: 's3',
    description: 'Centrifugal pump for cargo operations',
    status: 'needs_maintenance',
    serialNumber: 'CP-9912-0183',
    manufacturer: 'Shinko Industries',
    modelNumber: 'IHI-VLO-250',
    installationDate: '2019-03-10',
    lastMaintenanceDate: '2022-11-20'
  },
  {
    id: 'c8',
    name: 'Car Deck Ramp',
    category: 'Machinery',
    shipId: 's4',
    description: 'Hydraulic ramp for vehicle loading',
    status: 'needs_maintenance',
    serialNumber: 'DR-2011-0873',
    manufacturer: 'MacGregor',
    modelNumber: 'RoRo-HD-30',
    installationDate: '2012-09-20',
    lastMaintenanceDate: '2022-10-05'
  }
];

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs, addJob, updateJob, getJobById, jobTypes, jobPriorities, jobStatuses } = useJobs();
  const { ships } = useShips();
  const { components, addComponent } = useComponents();

  const [currentStep, setCurrentStep] = useState(1);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'routine',
    priority: 'medium',
    status: 'pending',
    shipId: '',
    componentId: '',
    assignedEngineerId: '',
    estimatedHours: 1,
    actualHours: 0,
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 1 week from now
    progressPercentage: 0,
    notes: [],
    attachments: [],
    createdBy: 'admin'
  });

  // Check if demo components need to be added
  useEffect(() => {
    // If there are no components, add the demo components
    if (components.length === 0) {
      demoComponents.forEach(component => {
        addComponent(component);
      });
    }
  }, [components, addComponent]);

  useEffect(() => {
    if (id) {
      const job = getJobById(id);
      if (job) {
        setFormData({
          ...job,
          scheduledDate: job.scheduledDate ? format(new Date(job.scheduledDate), 'yyyy-MM-dd') : '',
          dueDate: job.dueDate ? format(new Date(job.dueDate), 'yyyy-MM-dd') : '',
          startDate: job.startDate ? format(new Date(job.startDate), 'yyyy-MM-dd') : '',
          completionDate: job.completionDate ? format(new Date(job.completionDate), 'yyyy-MM-dd') : ''
        });
      }
    }
  }, [id, getJobById]);

  // Update filtered components when ship is selected
  useEffect(() => {
    if (formData.shipId) {
      const shipComponents = components.filter(c => c.shipId === formData.shipId);
      console.log('Filtered components for ship:', formData.shipId, shipComponents);
      setFilteredComponents(shipComponents);
    } else {
      setFilteredComponents([]);
    }
  }, [formData.shipId, components]);

  // Temporary file storage for attachments
  const [fileAttachments, setFileAttachments] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If shipId changes, reset componentId
    if (name === 'shipId') {
      setFormData(prev => ({
        ...prev,
        shipId: value,
        componentId: '' // Reset component selection when ship changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Store the actual file object
      uploadedBy: 'admin',
      url: URL.createObjectURL(file) // Create a temporary URL
    }));

    setFileAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setFileAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.title.trim()) {
        stepErrors.title = 'Job title is required';
        isValid = false;
      }
      if (!formData.jobType) {
        stepErrors.jobType = 'Job type is required';
        isValid = false;
      }
    }
    
    if (step === 2) {
      if (!formData.shipId) {
        stepErrors.shipId = 'Ship selection is required';
        isValid = false;
      }
      if (!formData.componentId) {
        stepErrors.componentId = 'Component selection is required';
        isValid = false;
      }
    }
    
    if (step === 4) {
      if (!formData.scheduledDate) {
        stepErrors.scheduledDate = 'Scheduled date is required';
        isValid = false;
      }
      if (!formData.dueDate) {
        stepErrors.dueDate = 'Due date is required';
        isValid = false;
      }
      if (formData.estimatedHours <= 0) {
        stepErrors.estimatedHours = 'Estimated hours must be greater than 0';
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process attachments
      const attachments = fileAttachments.map(({ name, size, type, url, uploadedBy }) => ({
        name,
        size,
        type,
        url, // In a real app, you would upload to a server and get a permanent URL
        uploadedBy
      }));

      const jobData = {
        ...formData,
        attachments: [...(formData.attachments || []), ...attachments]
      };

      if (id) {
        await updateJob(id, jobData);
        toast.success('Job updated successfully');
      } else {
        await addJob(jobData);
        toast.success('Job created successfully');
      }
      navigate('/jobs');
    } catch (error) {
      toast.error('Failed to save job');
      console.error('Failed to save job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Estimated completion calculation
  const calculateEstimatedCompletion = () => {
    if (!formData.scheduledDate || !formData.estimatedHours) return 'Not available';
    
    const scheduledDate = new Date(formData.scheduledDate);
    const estimatedHours = parseInt(formData.estimatedHours);
    
    // Add estimated hours to scheduled date
    scheduledDate.setHours(scheduledDate.getHours() + estimatedHours);
    
    return format(scheduledDate, 'MMM dd, yyyy HH:mm');
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

  const renderStepIndicator = () => {
    return (
      <div className="ship-form-steps">
        <div className={`ship-form-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 1 ? <FiCheck className="step-check" /> : 1}
          </div>
          <span className="ship-step-label">Job Details</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 2 ? <FiCheck className="step-check" /> : 2}
          </div>
          <span className="ship-step-label">Component Selection</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 3 ? <FiCheck className="step-check" /> : 3}
          </div>
          <span className="ship-step-label">Assignment</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="ship-step-number">4</div>
          <span className="ship-step-label">Schedule</span>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">
            <FiFileText className="mr-2" />
            Job Details
          </h3>
          <p className="ship-form-card-description">
            Enter the basic details of the maintenance job.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-group">
            <label className="ship-form-label">
              Job Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              className={`ship-form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter job title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <div className="ship-form-error">{errors.title}</div>}
          </div>

          <div className="ship-form-row">
            <div className="ship-form-group">
              <label className="ship-form-label">
                Job Type <span className="required">*</span>
              </label>
              <select
                name="jobType"
                className={`ship-form-input ${errors.jobType ? 'error' : ''}`}
                value={formData.jobType}
                onChange={handleChange}
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.jobType && <div className="ship-form-error">{errors.jobType}</div>}
            </div>

            <div className="ship-form-group">
              <label className="ship-form-label">
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  className="ship-form-input"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {jobPriorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: getPriorityColor(formData.priority) }}
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <div className="ship-form-group">
            <label className="ship-form-label">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              className="ship-form-input"
              placeholder="Provide a detailed description of the maintenance job"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">
            <FiAnchor className="mr-2" />
            Component Selection
          </h3>
          <p className="ship-form-card-description">
            Select the ship and component that requires maintenance.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label className="ship-form-label">
                Ship <span className="required">*</span>
              </label>
              <select
                name="shipId"
                className={`ship-form-input ${errors.shipId ? 'error' : ''}`}
                value={formData.shipId}
                onChange={handleChange}
              >
                <option value="">Select a ship</option>
                {ships.map(ship => (
                  <option key={ship.id} value={ship.id}>
                    {ship.name}
                  </option>
                ))}
              </select>
              {errors.shipId && <div className="ship-form-error">{errors.shipId}</div>}
            </div>

            <div className="ship-form-group">
              <label className="ship-form-label">
                Component <span className="required">*</span>
              </label>
              <select
                name="componentId"
                className={`ship-form-input ${errors.componentId ? 'error' : ''}`}
                value={formData.componentId}
                onChange={handleChange}
                disabled={!formData.shipId}
              >
                <option value="">Select a component</option>
                {filteredComponents.length > 0 ? (
                  filteredComponents.map(component => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))
                ) : formData.shipId ? (
                  <option value="" disabled>No components found for this ship</option>
                ) : null}
              </select>
              {errors.componentId && <div className="ship-form-error">{errors.componentId}</div>}
              {!formData.shipId ? (
                <div className="text-sm text-gray-500 mt-1">Please select a ship first</div>
              ) : filteredComponents.length === 0 ? (
                <div className="text-sm text-orange-500 mt-1">No components available for this ship</div>
              ) : null}
            </div>
          </div>

          {formData.componentId && (
            <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <FiAlertTriangle className="mr-2 text-blue-600" />
                Component History
              </h4>
              <p className="text-sm text-blue-700">
                This component has had 3 maintenance jobs in the past 12 months.
              </p>
              <div className="mt-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <FiClock className="mr-1" />
                  <span>Last maintenance: 45 days ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">
            <FiTool className="mr-2" />
            Engineer Assignment
          </h3>
          <p className="ship-form-card-description">
            Assign an engineer to this maintenance job.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-group">
            <label className="ship-form-label">
              Assigned Engineer
            </label>
            <select
              name="assignedEngineerId"
              className="ship-form-input"
              value={formData.assignedEngineerId}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              <option value="1">John Smith - Engine Specialist</option>
              <option value="2">Maria Rodriguez - Navigation Expert</option>
              <option value="3">David Chen - General Maintenance</option>
            </select>
          </div>

          <div className="mt-6">
            <h4 className="ship-form-section-title">Recommended Engineers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Engineer Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex-shrink-0 mr-3 flex items-center justify-center">
                  <span className="text-cyan-700 font-semibold">JS</span>
                </div>
                <div className="flex-grow">
                  <h5 className="font-medium text-gray-900">John Smith</h5>
                  <p className="text-sm text-gray-600">Engine Specialist</p>
                  <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">60% workload</p>
                    <button
                      type="button"
                      className="maritime-btn maritime-btn-primary text-xs py-1 px-3"
                      onClick={() => setFormData(prev => ({ ...prev, assignedEngineerId: '1' }))}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Engineer Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-green-100 flex-shrink-0 mr-3 flex items-center justify-center">
                  <span className="text-green-700 font-semibold">DC</span>
                </div>
                <div className="flex-grow">
                  <h5 className="font-medium text-gray-900">David Chen</h5>
                  <p className="text-sm text-gray-600">General Maintenance</p>
                  <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">40% workload</p>
                    <button
                      type="button"
                      className="maritime-btn maritime-btn-primary text-xs py-1 px-3"
                      onClick={() => setFormData(prev => ({ ...prev, assignedEngineerId: '3' }))}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">
            <FiCalendar className="mr-2" />
            Schedule & Attachments
          </h3>
          <p className="ship-form-card-description">
            Set the schedule and add any relevant documents.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label className="ship-form-label">
                Scheduled Date <span className="required">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="scheduledDate"
                  className={`ship-form-input pl-10 ${errors.scheduledDate ? 'error' : ''}`}
                  value={formData.scheduledDate}
                  onChange={handleChange}
                />
              </div>
              {errors.scheduledDate && <div className="ship-form-error">{errors.scheduledDate}</div>}
            </div>

            <div className="ship-form-group">
              <label className="ship-form-label">
                Due Date <span className="required">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="dueDate"
                  className={`ship-form-input pl-10 ${errors.dueDate ? 'error' : ''}`}
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
              {errors.dueDate && <div className="ship-form-error">{errors.dueDate}</div>}
            </div>
          </div>

          <div className="ship-form-row">
            <div className="ship-form-group">
              <label className="ship-form-label">
                Estimated Hours <span className="required">*</span>
              </label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="estimatedHours"
                  min="0.5"
                  step="0.5"
                  className={`ship-form-input pl-10 ${errors.estimatedHours ? 'error' : ''}`}
                  value={formData.estimatedHours}
                  onChange={handleChange}
                />
              </div>
              {errors.estimatedHours && <div className="ship-form-error">{errors.estimatedHours}</div>}
            </div>

            <div className="ship-form-group">
              <label className="ship-form-label">
                Estimated Completion
              </label>
              <div className="ship-form-input bg-gray-50 flex items-center">
                <FiClock className="mr-2 text-gray-500" />
                {calculateEstimatedCompletion()}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="ship-form-section-title">Attachments</h4>
            <div className="ship-form-image-upload mt-2">
              <label className="ship-form-upload-placeholder">
                <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Upload files</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</span>
                <input
                  type="file"
                  name="attachments"
                  className="ship-form-file-input"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {fileAttachments.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h5>
                <ul className="ship-form-document-list">
                  {fileAttachments.map((file, index) => (
                    <li key={index} className="ship-form-document-item">
                      <div className="flex items-center">
                        <FiFileText className="text-gray-500 mr-2" />
                        <div>
                          <span className="ship-form-document-name">{file.name}</span>
                          <span className="ship-form-document-size">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="ship-form-document-remove"
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="ship-form-container">
      <div className="ship-form-header">
        <Link to="/jobs" className="ship-form-back-btn">
          <FiArrowLeft />
          <span>Back to Jobs</span>
        </Link>
        <h1 className="ship-form-title">
          {id ? 'Edit Maintenance Job' : 'Create New Maintenance Job'}
        </h1>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="ship-form">
        {renderCurrentStep()}

        <div className="ship-form-actions">
          <button
            type="button"
            className="ship-form-btn ship-form-btn-secondary"
            onClick={currentStep === 1 ? () => navigate('/jobs') : prevStep}
          >
            {currentStep === 1 ? 'Cancel' : (
              <>
                <FiArrowLeft className="mr-2" />
                Back
              </>
            )}
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              className="ship-form-btn ship-form-btn-primary"
              onClick={nextStep}
            >
              Next
              <FiArrowRight className="ml-2" />
            </button>
          ) : (
            <button 
              type="submit"
              className="ship-form-btn ship-form-btn-success"
              disabled={isSubmitting}
            >
              <FiSave className="mr-2" />
              {id ? 'Update Job' : 'Create Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default JobForm; 