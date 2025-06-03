import { useState, useEffect } from 'react';
import { useComponents } from '../../contexts/ComponentsContext';
import { useShips } from '../../contexts/ShipsContext';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import './ComponentsStyles.css';

const ComponentModal = ({ isOpen, onClose, component = null, shipId = null }) => {
  const { addComponent, updateComponent, getComponentById } = useComponents();
  const { ships } = useShips();
  const isEditing = Boolean(component);

  const initialFormState = {
    name: '',
    serialNumber: '',
    category: '',
    shipId: shipId || '',
    installationDate: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name || '',
        serialNumber: component.serialNumber || '',
        category: component.category || '',
        shipId: component.shipId || '',
        installationDate: component.installationDate || '',
        notes: component.notes || '',
      });
    } else if (shipId) {
      setFormData((prev) => ({ ...prev, shipId }));
    } else {
      setFormData(initialFormState);
    }
    
    // Reset errors and touched states
    setErrors({});
    setTouched({});
  }, [component, shipId, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Component Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Component name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Component name must be at least 3 characters';
    }
    
    // Serial Number validation
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Ship validation
    if (!formData.shipId) {
      newErrors.shipId = 'Ship is required';
    }
    
    // Installation Date validation
    if (!formData.installationDate) {
      newErrors.installationDate = 'Installation date is required';
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.installationDate);
      if (selectedDate > today) {
        newErrors.installationDate = 'Installation date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isEditing) {
        updateComponent(component.id, formData);
      } else {
        addComponent(formData);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Component' : 'Add New Component'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="component-form">
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">
                Component Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name && touched.name ? 'form-input error' : 'form-input'}
                placeholder="Enter component name"
              />
              {errors.name && touched.name && (
                <div className="form-error">
                  <FiAlertCircle size={14} className="mr-1" />
                  {errors.name}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="serialNumber">
                Serial Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className={errors.serialNumber && touched.serialNumber ? 'form-input error' : 'form-input'}
                placeholder="Enter serial number"
              />
              {errors.serialNumber && touched.serialNumber && (
                <div className="form-error">
                  <FiAlertCircle size={14} className="mr-1" />
                  {errors.serialNumber}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category && touched.category ? 'form-select error' : 'form-select'}
              >
                <option value="">Select a category</option>
                <option value="Machinery">Machinery</option>
                <option value="Engine">Engine</option>
                <option value="Hull">Hull</option>
                <option value="Navigation">Navigation</option>
                <option value="Electrical">Electrical</option>
              </select>
              {errors.category && touched.category && (
                <div className="form-error">
                  <FiAlertCircle size={14} className="mr-1" />
                  {errors.category}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="shipId">
                Ship <span className="required">*</span>
              </label>
              <select
                id="shipId"
                name="shipId"
                value={formData.shipId}
                onChange={handleChange}
                className={errors.shipId && touched.shipId ? 'form-select error' : 'form-select'}
              >
                <option value="">Select a ship</option>
                {ships.map((ship) => (
                  <option key={ship.id} value={ship.id}>
                    {ship.name}
                  </option>
                ))}
              </select>
              {errors.shipId && touched.shipId && (
                <div className="form-error">
                  <FiAlertCircle size={14} className="mr-1" />
                  {errors.shipId}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="installationDate">
                Installation Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="installationDate"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleChange}
                className={errors.installationDate && touched.installationDate ? 'form-input error' : 'form-input'}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.installationDate && touched.installationDate && (
                <div className="form-error">
                  <FiAlertCircle size={14} className="mr-1" />
                  {errors.installationDate}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Optional notes about the component"
                rows={3}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Component' : 'Add Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComponentModal; 