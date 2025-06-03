import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/localStorageUtils';
import { addDays, isAfter, differenceInDays } from 'date-fns';

const ComponentsContext = createContext(null);

export const ComponentsProvider = ({ children }) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponents, setSelectedComponents] = useState([]);

  useEffect(() => {
    const storedComponents = getItem('components');
    if (storedComponents) {
      setComponents(storedComponents);
    }
    setLoading(false);
  }, []);

  const addComponent = (component) => {
    // Calculate maintenance interval based on category if not provided
    const maintenanceInterval = component.maintenanceInterval || 
      getDefaultMaintenanceInterval(component.category);
    
    // Calculate next maintenance date if not provided
    let nextMaintenanceDate = component.nextMaintenanceDate;
    if (!nextMaintenanceDate && component.lastMaintenanceDate) {
      const lastMaintenance = new Date(component.lastMaintenanceDate);
      nextMaintenanceDate = addDays(lastMaintenance, maintenanceInterval).toISOString().split('T')[0];
    }
    
    const newComponent = {
      ...component,
      id: `c${Date.now()}`,
      healthScore: component.healthScore || calculateHealthScore(component),
      maintenanceHistory: component.maintenanceHistory || [],
      status: component.status || determineComponentStatus(component),
      specifications: component.specifications || {},
      images: component.images || [],
      documents: component.documents || [],
      maintenanceInterval: maintenanceInterval,
      nextMaintenanceDate: nextMaintenanceDate,
      createdAt: new Date().toISOString()
    };
    
    const updatedComponents = [...components, newComponent];
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
    return newComponent;
  };

  const updateComponent = (id, updates) => {
    // Calculate maintenance interval based on category if being updated
    let maintenanceInterval = updates.maintenanceInterval;
    if (updates.category && !maintenanceInterval) {
      const component = getComponentById(id);
      maintenanceInterval = getDefaultMaintenanceInterval(updates.category);
    }
    
    // Calculate next maintenance date if last maintenance date is being updated
    let nextMaintenanceDate = updates.nextMaintenanceDate;
    if (updates.lastMaintenanceDate && !nextMaintenanceDate) {
      const interval = maintenanceInterval || 
        components.find(c => c.id === id)?.maintenanceInterval || 
        90;
      nextMaintenanceDate = addDays(
        new Date(updates.lastMaintenanceDate), 
        interval
      ).toISOString().split('T')[0];
    }
    
    const updatedComponents = components.map((component) =>
      component.id === id ? { 
        ...component, 
        ...updates,
        maintenanceInterval: maintenanceInterval || component.maintenanceInterval,
        nextMaintenanceDate: nextMaintenanceDate || component.nextMaintenanceDate,
        healthScore: updates.healthScore !== undefined ? 
          updates.healthScore : 
          calculateHealthScore({...component, ...updates}),
        status: updates.status !== undefined ? 
          updates.status : 
          determineComponentStatus({...component, ...updates}),
        updatedAt: new Date().toISOString()
      } : component
    );
    
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  const deleteComponent = (id) => {
    const updatedComponents = components.filter((component) => component.id !== id);
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  const bulkDeleteComponents = (ids) => {
    const updatedComponents = components.filter((component) => !ids.includes(component.id));
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
    setSelectedComponents([]);
  };

  const bulkUpdateComponents = (ids, updates) => {
    const updatedComponents = components.map((component) =>
      ids.includes(component.id) ? { 
        ...component, 
        ...updates,
        healthScore: updates.healthScore !== undefined ? 
          updates.healthScore : 
          calculateHealthScore({...component, ...updates}),
        status: updates.status !== undefined ? 
          updates.status : 
          determineComponentStatus({...component, ...updates}),
        updatedAt: new Date().toISOString()
      } : component
    );
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  const getComponentById = (id) => {
    return components.find((component) => component.id === id);
  };

  const getComponentsByShipId = (shipId) => {
    return components.filter((component) => component.shipId === shipId);
  };

  const updateLastMaintenanceDate = (id, date) => {
    const component = getComponentById(id);
    if (!component) return;

    const maintenanceEvent = {
      id: `m${Date.now()}`,
      date,
      type: 'maintenance',
      title: 'Maintenance Performed',
      description: 'Regular maintenance performed',
      createdAt: new Date().toISOString()
    };

    // Calculate next maintenance date based on interval
    const interval = component.maintenanceInterval || 90;
    const nextMaintenanceDate = addDays(new Date(date), interval).toISOString().split('T')[0];

    const updatedComponents = components.map((comp) =>
      comp.id === id
        ? { 
            ...comp, 
            lastMaintenanceDate: date,
            maintenanceHistory: [...(comp.maintenanceHistory || []), maintenanceEvent],
            nextMaintenanceDate,
            status: 'operational',
            healthScore: 100,
            updatedAt: new Date().toISOString()
          }
        : comp
    );
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  const getDefaultMaintenanceInterval = (category) => {
    // Default maintenance intervals based on component category (in days)
    switch(category?.toLowerCase()) {
      case 'engine':
        return 60; // More frequent maintenance for engines
      case 'navigation':
        return 90; // Standard interval for navigation equipment
      case 'electrical':
        return 120; // Longer interval for electrical systems
      case 'hull':
        return 180; // Longest interval for hull components
      default:
        return 90; // Default interval if category not specified
    }
  };

  const calculateHealthScore = (component) => {
    if (!component.lastMaintenanceDate) return 50;
    
    const lastMaintenance = new Date(component.lastMaintenanceDate);
    const today = new Date();
    const daysSinceLastMaintenance = differenceInDays(today, lastMaintenance);
    
    // Get maintenance interval (default to 90 days if not specified)
    const maintenanceInterval = component.maintenanceInterval || 
      getDefaultMaintenanceInterval(component.category) || 
      90;
    
    // Health score decreases over time since last maintenance
    // 100% at maintenance date, 0% at 2x maintenance interval
    const healthScore = 100 - (daysSinceLastMaintenance / (maintenanceInterval * 2) * 100);
    
    // Ensure health score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(healthScore)));
  };

  const determineComponentStatus = (component) => {
    if (!component.lastMaintenanceDate) return 'needs_maintenance';
    
    const lastMaintenance = new Date(component.lastMaintenanceDate);
    const today = new Date();
    const daysSinceLastMaintenance = differenceInDays(today, lastMaintenance);
    
    // Get maintenance interval (default to 90 days if not specified)
    const maintenanceInterval = component.maintenanceInterval || 
      getDefaultMaintenanceInterval(component.category) || 
      90;
    
    if (daysSinceLastMaintenance > maintenanceInterval * 1.5) return 'critical';
    if (daysSinceLastMaintenance > maintenanceInterval * 0.8) return 'needs_maintenance';
    return 'operational';
  };

  const toggleComponentSelection = (id) => {
    setSelectedComponents(prev => {
      if (prev.includes(id)) {
        return prev.filter(componentId => componentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const clearComponentSelection = () => {
    setSelectedComponents([]);
  };

  const selectAllComponents = (componentIds) => {
    setSelectedComponents(componentIds);
  };

  const getComponentsNeedingMaintenance = () => {
    return components.filter(component => 
      component.status === 'needs_maintenance' || component.status === 'critical'
    );
  };

  const generateComponentQRCode = (componentId) => {
    const component = getComponentById(componentId);
    if (!component) return null;
    
    // Generate a QR code data URL
    // In a real application, this would call a QR code generation API or use a library
    const qrCodeData = `component:${component.id}:${component.serialNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}`;
  };

  const addMaintenanceEvent = (componentId, event) => {
    const component = getComponentById(componentId);
    if (!component) return;
    
    const maintenanceEvent = {
      id: `m${Date.now()}`,
      ...event,
      createdAt: new Date().toISOString()
    };
    
    const updatedComponents = components.map((comp) =>
      comp.id === componentId
        ? { 
            ...comp, 
            maintenanceHistory: [...(comp.maintenanceHistory || []), maintenanceEvent],
            updatedAt: new Date().toISOString()
          }
        : comp
    );
    
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  const scheduleMaintenanceEvent = (componentId, date, title, description) => {
    const component = getComponentById(componentId);
    if (!component) return;
    
    const maintenanceEvent = {
      id: `m${Date.now()}`,
      date,
      type: 'scheduled',
      title: title || 'Scheduled Maintenance',
      description: description || 'Regular maintenance scheduled',
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };
    
    const updatedComponents = components.map((comp) =>
      comp.id === componentId
        ? { 
            ...comp, 
            maintenanceHistory: [...(comp.maintenanceHistory || []), maintenanceEvent],
            nextMaintenanceDate: date,
            updatedAt: new Date().toISOString()
          }
        : comp
    );
    
    setComponents(updatedComponents);
    setItem('components', updatedComponents);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ComponentsContext.Provider
      value={{
        components,
        addComponent,
        updateComponent,
        deleteComponent,
        getComponentById,
        getComponentsByShipId,
        updateLastMaintenanceDate,
        bulkDeleteComponents,
        bulkUpdateComponents,
        selectedComponents,
        toggleComponentSelection,
        clearComponentSelection,
        selectAllComponents,
        getComponentsNeedingMaintenance,
        generateComponentQRCode,
        addMaintenanceEvent,
        scheduleMaintenanceEvent,
        calculateHealthScore,
        determineComponentStatus
      }}
    >
      {children}
    </ComponentsContext.Provider>
  );
};

export const useComponents = () => {
  const context = useContext(ComponentsContext);
  if (!context) {
    throw new Error('useComponents must be used within a ComponentsProvider');
  }
  return context;
}; 