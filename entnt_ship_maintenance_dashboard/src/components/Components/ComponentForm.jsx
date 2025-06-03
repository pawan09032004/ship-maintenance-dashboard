import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useComponents } from '../../contexts/ComponentsContext';
import { useShips } from '../../contexts/ShipsContext';
import { FiChevronRight, FiChevronLeft, FiSave, FiX, FiUpload, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ComponentsStyles.css';

const ComponentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addComponent, updateComponent, getComponentById } = useComponents();
  const { ships } = useShips();
  const isEditing = Boolean(id);

  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    shipId: '',
    category: '',
    manufacturer: '',
    model: '',
    description: '',
    installationDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    status: 'operational',
    healthScore: 100,
    specifications: {},
    images: [],
    documents: [],
    maintenanceHistory: []
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Image preview
  const [imagePreview, setImagePreview] = useState(null);
  
  // Specifications
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    if (isEditing) {
      const component = getComponentById(id);
      if (component) {
        setFormData({
          ...component,
          // Ensure all required fields exist
          specifications: component.specifications || {},
          images: component.images || [],
          documents: component.documents || [],
          maintenanceHistory: component.maintenanceHistory || []
        });
      } else {
        toast.error('Component not found');
        navigate('/components');
      }
    } else {
      // Set default shipId from query parameter if available
      const params = new URLSearchParams(location.search);
      const shipId = params.get('shipId');
      if (shipId) {
        setFormData((prev) => ({ ...prev, shipId }));
      }
    }
  }, [id, isEditing, getComponentById, navigate, location.search]);

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        stepErrors.name = 'Component name is required';
        isValid = false;
      }
      
      if (!formData.serialNumber.trim()) {
        stepErrors.serialNumber = 'Serial number is required';
        isValid = false;
      }
      
      if (!formData.shipId) {
        stepErrors.shipId = 'Ship is required';
        isValid = false;
      }
      
      if (!formData.category) {
        stepErrors.category = 'Category is required';
        isValid = false;
      }
    }
    
    if (step === 2) {
      if (!formData.installationDate) {
        stepErrors.installationDate = 'Installation date is required';
        isValid = false;
      }
      
      if (!formData.manufacturer.trim()) {
        stepErrors.manufacturer = 'Manufacturer is required';
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = {
        id: `img_${Date.now()}`,
        name: file.name,
        data: event.target.result,
        type: file.type,
        uploadDate: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageData]
      }));
      
      setImagePreview(event.target.result);
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      toast.error('Both key and value are required for specifications');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [newSpecKey]: newSpecValue
      }
    }));
    
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpecification = (key) => {
    const updatedSpecs = { ...formData.specifications };
    delete updatedSpecs[key];
    
    setFormData(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setCurrentStep(step);
        break;
      }
    }
    
    if (!isValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      // Calculate next maintenance date if not set
      let dataToSubmit = { ...formData };
      if (!dataToSubmit.nextMaintenanceDate && dataToSubmit.lastMaintenanceDate) {
        const lastMaintenance = new Date(dataToSubmit.lastMaintenanceDate);
        const nextMaintenance = new Date(lastMaintenance);
        nextMaintenance.setDate(nextMaintenance.getDate() + 90); // 90 days after last maintenance
        dataToSubmit.nextMaintenanceDate = nextMaintenance.toISOString().split('T')[0];
      }
      
      if (isEditing) {
        updateComponent(id, dataToSubmit);
        toast.success('Component updated successfully');
      } else {
        addComponent(dataToSubmit);
        toast.success('Component added successfully');
      }
      navigate(`/ships/${formData.shipId}`);
    } catch (error) {
      toast.error('An error occurred while saving the component');
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="component-form-steps">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
          <div 
            key={step} 
            className={`component-form-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            onClick={() => validateStep(currentStep) && setCurrentStep(step)}
          >
            <div className="component-form-step-number">{step}</div>
            <div className="component-form-step-label">
              {step === 1 && 'General Info'}
              {step === 2 && 'Installation Details'}
              {step === 3 && 'Specifications'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="component-form-section">
            <h3 className="component-form-section-title">General Information</h3>
            
            <div className="component-form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Component Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name && touched.name ? 'input-error' : ''}`}
                  placeholder="Enter component name"
                />
                {errors.name && touched.name && <div className="error-message">{errors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="serialNumber" className="form-label">Serial Number *</label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={`input ${errors.serialNumber && touched.serialNumber ? 'input-error' : ''}`}
                  placeholder="Enter serial number"
                />
                {errors.serialNumber && touched.serialNumber && <div className="error-message">{errors.serialNumber}</div>}
              </div>
            </div>
            
            <div className="component-form-row">
              <div className="form-group">
                <label htmlFor="shipId" className="form-label">Ship *</label>
                <select
                  id="shipId"
                  name="shipId"
                  value={formData.shipId}
                  onChange={handleChange}
                  className={`input ${errors.shipId && touched.shipId ? 'input-error' : ''}`}
                >
                  <option value="">Select a ship</option>
                  {ships.map((ship) => (
                    <option key={ship.id} value={ship.id}>
                      {ship.name} {ship.imoNumber ? `(IMO: ${ship.imoNumber})` : ''}
                    </option>
                  ))}
                </select>
                {errors.shipId && touched.shipId && <div className="error-message">{errors.shipId}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input ${errors.category && touched.category ? 'input-error' : ''}`}
                >
                  <option value="">Select a category</option>
                  <option value="Engine">Engine</option>
                  <option value="Navigation">Navigation</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Hull">Hull</option>
                  <option value="Safety">Safety</option>
                  <option value="Communication">Communication</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && touched.category && <div className="error-message">{errors.category}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows={4}
                placeholder="Enter component description"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="component-form-section">
            <h3 className="component-form-section-title">Installation & Maintenance Details</h3>
            
            <div className="component-form-row">
              <div className="form-group">
                <label htmlFor="manufacturer" className="form-label">Manufacturer *</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={`input ${errors.manufacturer && touched.manufacturer ? 'input-error' : ''}`}
                  placeholder="Enter manufacturer name"
                />
                {errors.manufacturer && touched.manufacturer && <div className="error-message">{errors.manufacturer}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="model" className="form-label">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter model number"
                />
              </div>
            </div>
            
            <div className="component-form-row">
              <div className="form-group">
                <label htmlFor="installationDate" className="form-label">Installation Date *</label>
                <input
                  type="date"
                  id="installationDate"
                  name="installationDate"
                  value={formData.installationDate}
                  onChange={handleChange}
                  className={`input ${errors.installationDate && touched.installationDate ? 'input-error' : ''}`}
                />
                {errors.installationDate && touched.installationDate && <div className="error-message">{errors.installationDate}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastMaintenanceDate" className="form-label">Last Maintenance Date</label>
                <input
                  type="date"
                  id="lastMaintenanceDate"
                  name="lastMaintenanceDate"
                  value={formData.lastMaintenanceDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            
            <div className="component-form-row">
              <div className="form-group">
                <label htmlFor="status" className="form-label">Current Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="operational">Operational</option>
                  <option value="needs_maintenance">Needs Maintenance</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="nextMaintenanceDate" className="form-label">Next Scheduled Maintenance</label>
                <input
                  type="date"
                  id="nextMaintenanceDate"
                  name="nextMaintenanceDate"
                  value={formData.nextMaintenanceDate}
                  onChange={handleChange}
                  className="input"
                />
                <div className="form-helper-text">
                  <FiAlertCircle size={14} className="mr-1" />
                  If not set, will default to 90 days after last maintenance
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="component-form-section">
            <h3 className="component-form-section-title">Technical Specifications & Images</h3>
            
            {/* Specifications */}
            <div className="component-specifications-section">
              <h4 className="component-form-subsection-title">Technical Specifications</h4>
              
              <div className="component-form-row">
                <div className="form-group">
                  <label htmlFor="newSpecKey" className="form-label">Specification Name</label>
                  <input
                    type="text"
                    id="newSpecKey"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="input"
                    placeholder="e.g. Weight, Power, Dimensions"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newSpecValue" className="form-label">Value</label>
                  <input
                    type="text"
                    id="newSpecValue"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="input"
                    placeholder="e.g. 500kg, 1200W, 30x40x10cm"
                  />
                </div>
                
                <div className="form-group spec-button-container">
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="btn btn-secondary btn-add-spec"
                  >
                    <FiPlus size={16} />
                    Add
                  </button>
                </div>
              </div>
              
              {/* Display existing specifications */}
              {Object.keys(formData.specifications).length > 0 ? (
                <div className="specifications-list">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="specification-item">
                      <div className="specification-content">
                        <span className="specification-key">{key}:</span>
                        <span className="specification-value">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="btn-remove-spec"
                        aria-label="Remove specification"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-specifications">
                  No specifications added yet
                </div>
              )}
            </div>
            
            {/* Images */}
            <div className="component-images-section">
              <h4 className="component-form-subsection-title">Component Images</h4>
              
              <div className="image-upload-container">
                <label htmlFor="imageUpload" className="image-upload-label">
                  <FiUpload size={24} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                  />
                </label>
                
                <div className="image-preview-container">
                  {formData.images.length > 0 ? (
                    <div className="image-gallery">
                      {formData.images.map(image => (
                        <div key={image.id} className="image-preview-item">
                          <img src={image.data} alt={image.name} className="image-preview" />
                          <div className="image-preview-overlay">
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="btn-remove-image"
                              aria-label="Remove image"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                          <div className="image-name">{image.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-images">
                      No images uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="component-form-container">
      <div className="component-form-card">
        <h1 className="component-form-title">
          {isEditing ? 'Edit Component' : 'Add New Component'}
        </h1>

        {renderStepIndicator()}
        
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          <div className="component-form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-secondary"
              >
                <FiChevronLeft size={16} className="mr-1" />
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary"
              >
                Next
                <FiChevronRight size={16} className="ml-1" />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary">
                <FiSave size={16} className="mr-1" />
                {isEditing ? 'Update Component' : 'Save Component'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComponentForm; 