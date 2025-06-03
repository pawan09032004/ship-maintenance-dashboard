import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useShips } from '../../contexts/ShipsContext';
import { FiArrowLeft, FiArrowRight, FiSave, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import './ShipsStyles.css';

const ShipForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { ships, addShip, updateShip } = useShips();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    imo: '',
    flag: '',
    yearBuilt: new Date().getFullYear(),
    description: '',
    status: 'Active',
    lastMaintenance: new Date().toISOString().split('T')[0],
    image: null,
    documents: [],
    dimensions: {
      length: '',
      width: '',
      draft: ''
    },
    capacity: {
      deadweight: '',
      grossTonnage: '',
      netTonnage: ''
    },
    contactDetails: {
      owner: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (id) {
      const ship = ships.find(s => s.id === id);
      if (ship) {
        setFormData({
          ...ship,
          lastMaintenance: ship.lastMaintenance ? new Date(ship.lastMaintenance).toISOString().split('T')[0] : '',
          dimensions: ship.dimensions || {
            length: '',
            width: '',
            draft: ''
          },
          capacity: ship.capacity || {
            deadweight: '',
            grossTonnage: '',
            netTonnage: ''
          },
          contactDetails: ship.contactDetails || {
            owner: '',
            email: '',
            phone: ''
          }
        });
        if (ship.image) {
          setImagePreview(ship.image);
        }
      }
    }
  }, [id, ships]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
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
    const file = e.target.files[0];
    if (!file) return;

    // For image preview
    if (e.target.name === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
    
    // For documents
    if (e.target.name === 'documents') {
      const files = Array.from(e.target.files);
      const filePromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result,
              uploadDate: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(newDocuments => {
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, ...newDocuments]
        }));
      });
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        stepErrors.name = 'Ship name is required';
        isValid = false;
      }
      if (!formData.type.trim()) {
        stepErrors.type = 'Ship type is required';
        isValid = false;
      }
      if (formData.imo && !/^IMO\s*\d{7}$/i.test(formData.imo.trim())) {
        stepErrors.imo = 'IMO number must be in format IMO 1234567';
        isValid = false;
      }
    }
    
    if (step === 2) {
      if (formData.dimensions.length && isNaN(formData.dimensions.length)) {
        stepErrors['dimensions.length'] = 'Length must be a number';
        isValid = false;
      }
      if (formData.dimensions.width && isNaN(formData.dimensions.width)) {
        stepErrors['dimensions.width'] = 'Width must be a number';
        isValid = false;
      }
      if (formData.capacity.deadweight && isNaN(formData.capacity.deadweight)) {
        stepErrors['capacity.deadweight'] = 'Deadweight must be a number';
        isValid = false;
      }
    }
    
    if (step === 3) {
      if (formData.contactDetails.email && !/^\S+@\S+\.\S+$/.test(formData.contactDetails.email)) {
        stepErrors['contactDetails.email'] = 'Please enter a valid email';
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (id) {
        await updateShip(id, formData);
      } else {
        await addShip(formData);
      }
      navigate('/ships');
    } catch (error) {
      console.error('Failed to save ship:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="ship-form-steps">
        <div className={`ship-form-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 1 ? <FiCheck className="step-check" /> : 1}
          </div>
          <span className="ship-step-label">Basic Info</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 2 ? <FiCheck className="step-check" /> : 2}
          </div>
          <span className="ship-step-label">Specifications</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="ship-step-number">
            {currentStep > 3 ? <FiCheck className="step-check" /> : 3}
          </div>
          <span className="ship-step-label">Contact & Documents</span>
        </div>
        <div className="ship-form-step-connector"></div>
        <div className={`ship-form-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="ship-step-number">4</div>
          <span className="ship-step-label">Review</span>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">Basic Information</h3>
          <p className="ship-form-card-description">
            Enter the basic details of the ship.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="name" className="ship-form-label">Ship Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                id="name"
                className={`ship-form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="ship-form-error">{errors.name}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="type" className="ship-form-label">Ship Type <span className="required">*</span></label>
              <input
                type="text"
                name="type"
                id="type"
                className={`ship-form-input ${errors.type ? 'error' : ''}`}
                value={formData.type}
                onChange={handleChange}
              />
              {errors.type && <span className="ship-form-error">{errors.type}</span>}
            </div>
          </div>

          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="imo" className="ship-form-label">IMO Number</label>
              <input
                type="text"
                name="imo"
                id="imo"
                placeholder="IMO 1234567"
                className={`ship-form-input ${errors.imo ? 'error' : ''}`}
                value={formData.imo}
                onChange={handleChange}
              />
              {errors.imo && <span className="ship-form-error">{errors.imo}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="flag" className="ship-form-label">Flag</label>
              <input
                type="text"
                name="flag"
                id="flag"
                className="ship-form-input"
                value={formData.flag}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="status" className="ship-form-label">Status</label>
              <select
                name="status"
                id="status"
                className="ship-form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="ship-form-group">
              <label htmlFor="yearBuilt" className="ship-form-label">Year Built</label>
              <input
                type="number"
                name="yearBuilt"
                id="yearBuilt"
                className="ship-form-input"
                value={formData.yearBuilt}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="ship-form-group">
            <label htmlFor="description" className="ship-form-label">Description</label>
            <textarea
              name="description"
              id="description"
              rows={4}
              className="ship-form-textarea"
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
          <h3 className="ship-form-card-title">Ship Specifications</h3>
          <p className="ship-form-card-description">
            Enter the technical specifications of the ship.
          </p>
        </div>
        <div className="ship-form-card-body">
          <h4 className="ship-form-section-title">Dimensions</h4>
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="dimensions.length" className="ship-form-label">Length (meters)</label>
              <input
                type="text"
                name="dimensions.length"
                id="dimensions.length"
                className={`ship-form-input ${errors['dimensions.length'] ? 'error' : ''}`}
                value={formData.dimensions.length}
                onChange={handleChange}
              />
              {errors['dimensions.length'] && <span className="ship-form-error">{errors['dimensions.length']}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="dimensions.width" className="ship-form-label">Width (meters)</label>
              <input
                type="text"
                name="dimensions.width"
                id="dimensions.width"
                className={`ship-form-input ${errors['dimensions.width'] ? 'error' : ''}`}
                value={formData.dimensions.width}
                onChange={handleChange}
              />
              {errors['dimensions.width'] && <span className="ship-form-error">{errors['dimensions.width']}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="dimensions.draft" className="ship-form-label">Draft (meters)</label>
              <input
                type="text"
                name="dimensions.draft"
                id="dimensions.draft"
                className="ship-form-input"
                value={formData.dimensions.draft}
                onChange={handleChange}
              />
            </div>
          </div>

          <h4 className="ship-form-section-title">Capacity</h4>
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="capacity.deadweight" className="ship-form-label">Deadweight (tons)</label>
              <input
                type="text"
                name="capacity.deadweight"
                id="capacity.deadweight"
                className={`ship-form-input ${errors['capacity.deadweight'] ? 'error' : ''}`}
                value={formData.capacity.deadweight}
                onChange={handleChange}
              />
              {errors['capacity.deadweight'] && <span className="ship-form-error">{errors['capacity.deadweight']}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="capacity.grossTonnage" className="ship-form-label">Gross Tonnage</label>
              <input
                type="text"
                name="capacity.grossTonnage"
                id="capacity.grossTonnage"
                className="ship-form-input"
                value={formData.capacity.grossTonnage}
                onChange={handleChange}
              />
            </div>

            <div className="ship-form-group">
              <label htmlFor="capacity.netTonnage" className="ship-form-label">Net Tonnage</label>
              <input
                type="text"
                name="capacity.netTonnage"
                id="capacity.netTonnage"
                className="ship-form-input"
                value={formData.capacity.netTonnage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="lastMaintenance" className="ship-form-label">Last Maintenance Date</label>
              <input
                type="date"
                name="lastMaintenance"
                id="lastMaintenance"
                className="ship-form-input"
                value={formData.lastMaintenance}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">Contact & Documents</h3>
          <p className="ship-form-card-description">
            Add contact information and upload relevant documents.
          </p>
        </div>
        <div className="ship-form-card-body">
          <h4 className="ship-form-section-title">Contact Details</h4>
          <div className="ship-form-row">
            <div className="ship-form-group">
              <label htmlFor="contactDetails.owner" className="ship-form-label">Owner/Company</label>
              <input
                type="text"
                name="contactDetails.owner"
                id="contactDetails.owner"
                className="ship-form-input"
                value={formData.contactDetails.owner}
                onChange={handleChange}
              />
            </div>

            <div className="ship-form-group">
              <label htmlFor="contactDetails.email" className="ship-form-label">Email</label>
              <input
                type="email"
                name="contactDetails.email"
                id="contactDetails.email"
                className={`ship-form-input ${errors['contactDetails.email'] ? 'error' : ''}`}
                value={formData.contactDetails.email}
                onChange={handleChange}
              />
              {errors['contactDetails.email'] && <span className="ship-form-error">{errors['contactDetails.email']}</span>}
            </div>

            <div className="ship-form-group">
              <label htmlFor="contactDetails.phone" className="ship-form-label">Phone</label>
              <input
                type="text"
                name="contactDetails.phone"
                id="contactDetails.phone"
                className="ship-form-input"
                value={formData.contactDetails.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <h4 className="ship-form-section-title">Ship Image</h4>
          <div className="ship-form-image-upload">
            {imagePreview ? (
              <div className="ship-form-image-preview">
                <img src={imagePreview} alt="Ship preview" />
                <button 
                  type="button" 
                  className="ship-form-image-remove" 
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <label className="ship-form-image-label">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="ship-form-file-input"
                />
                <div className="ship-form-upload-placeholder">
                  <FiUpload />
                  <span>Upload Ship Image</span>
                </div>
              </label>
            )}
          </div>

          <h4 className="ship-form-section-title">Documents</h4>
          <div className="ship-form-documents">
            <label className="ship-form-document-label">
              <input
                type="file"
                name="documents"
                multiple
                onChange={handleFileChange}
                className="ship-form-file-input"
              />
              <div className="ship-form-upload-btn">
                <FiUpload className="mr-2" />
                Upload Documents
              </div>
            </label>

            {formData.documents.length > 0 && (
              <div className="ship-form-document-list">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="ship-form-document-item">
                    <span className="ship-form-document-name">{doc.name}</span>
                    <span className="ship-form-document-size">{(doc.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      className="ship-form-document-remove"
                      onClick={() => removeDocument(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="ship-form-card">
        <div className="ship-form-card-header">
          <h3 className="ship-form-card-title">Review Information</h3>
          <p className="ship-form-card-description">
            Please review all information before submitting.
          </p>
        </div>
        <div className="ship-form-card-body">
          <div className="ship-form-review">
            <div className="ship-form-review-section">
              <h4 className="ship-form-review-title">Basic Information</h4>
              <div className="ship-form-review-grid">
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Name:</span>
                  <span className="ship-form-review-value">{formData.name}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Type:</span>
                  <span className="ship-form-review-value">{formData.type}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">IMO:</span>
                  <span className="ship-form-review-value">{formData.imo || 'N/A'}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Flag:</span>
                  <span className="ship-form-review-value">{formData.flag || 'N/A'}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Status:</span>
                  <span className="ship-form-review-value">{formData.status}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Year Built:</span>
                  <span className="ship-form-review-value">{formData.yearBuilt}</span>
                </div>
              </div>
            </div>

            <div className="ship-form-review-section">
              <h4 className="ship-form-review-title">Specifications</h4>
              <div className="ship-form-review-grid">
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Length:</span>
                  <span className="ship-form-review-value">
                    {formData.dimensions.length ? `${formData.dimensions.length} m` : 'N/A'}
                  </span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Width:</span>
                  <span className="ship-form-review-value">
                    {formData.dimensions.width ? `${formData.dimensions.width} m` : 'N/A'}
                  </span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Draft:</span>
                  <span className="ship-form-review-value">
                    {formData.dimensions.draft ? `${formData.dimensions.draft} m` : 'N/A'}
                  </span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Deadweight:</span>
                  <span className="ship-form-review-value">
                    {formData.capacity.deadweight ? `${formData.capacity.deadweight} tons` : 'N/A'}
                  </span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Last Maintenance:</span>
                  <span className="ship-form-review-value">
                    {formData.lastMaintenance ? new Date(formData.lastMaintenance).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="ship-form-review-section">
              <h4 className="ship-form-review-title">Contact Information</h4>
              <div className="ship-form-review-grid">
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Owner:</span>
                  <span className="ship-form-review-value">{formData.contactDetails.owner || 'N/A'}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Email:</span>
                  <span className="ship-form-review-value">{formData.contactDetails.email || 'N/A'}</span>
                </div>
                <div className="ship-form-review-item">
                  <span className="ship-form-review-label">Phone:</span>
                  <span className="ship-form-review-value">{formData.contactDetails.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {imagePreview && (
              <div className="ship-form-review-section">
                <h4 className="ship-form-review-title">Ship Image</h4>
                <div className="ship-form-review-image">
                  <img src={imagePreview} alt="Ship" />
                </div>
              </div>
            )}

            {formData.documents.length > 0 && (
              <div className="ship-form-review-section">
                <h4 className="ship-form-review-title">Documents</h4>
                <div className="ship-form-review-documents">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="ship-form-review-document">
                      {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="ship-form-container">
      <div className="ship-form-header">
        <h1 className="ship-form-title">{id ? 'Edit Ship' : 'Add New Ship'}</h1>
        <Link to="/ships" className="ship-form-back-btn">
          <FiArrowLeft />
          Back to Ships
        </Link>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="ship-form">
        {renderCurrentStep()}

        <div className="ship-form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="ship-form-btn ship-form-btn-secondary"
              onClick={prevStep}
            >
              <FiArrowLeft className="mr-2" />
              Previous
            </button>
          )}
          
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
              {isSubmitting ? 'Saving...' : (
                <>
                  <FiSave className="mr-2" />
                  {id ? 'Update Ship' : 'Save Ship'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ShipForm; 