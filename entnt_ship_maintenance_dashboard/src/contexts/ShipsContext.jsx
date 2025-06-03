import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem } from '../utils/localStorageUtils';
import { toast } from 'react-hot-toast';

const ShipsContext = createContext(null);

// Demo data if no ships exist
const demoShips = [
  {
    id: 's1',
    name: 'Ocean Explorer',
    type: 'Container Ship',
    imo: 'IMO 9876543',
    flag: 'Panama',
    yearBuilt: 2018,
    description: 'Modern container vessel with capacity of 15,000 TEU',
    status: 'Active',
    lastMaintenance: new Date('2023-08-15').toISOString(),
    dimensions: {
      length: '366',
      width: '48.2',
      draft: '15.5'
    },
    capacity: {
      deadweight: '150000',
      grossTonnage: '165000',
      netTonnage: '85000'
    },
    contactDetails: {
      owner: 'Global Shipping Co.',
      email: 'operations@globalshipping.com',
      phone: '+1-555-123-4567'
    }
  },
  {
    id: 's2',
    name: 'Northern Star',
    type: 'Bulk Carrier',
    imo: 'IMO 9765432',
    flag: 'Liberia',
    yearBuilt: 2015,
    description: 'Bulk carrier specialized in grain transport',
    status: 'Under Maintenance',
    lastMaintenance: new Date('2023-10-05').toISOString(),
    dimensions: {
      length: '225',
      width: '32.2',
      draft: '12.5'
    },
    capacity: {
      deadweight: '82000',
      grossTonnage: '44000',
      netTonnage: '25000'
    }
  },
  {
    id: 's3',
    name: 'Pacific Voyager',
    type: 'Tanker',
    imo: 'IMO 9654321',
    flag: 'Marshall Islands',
    yearBuilt: 2019,
    description: 'Modern oil tanker with double hull design',
    status: 'Active',
    lastMaintenance: new Date('2023-09-20').toISOString()
  },
  {
    id: 's4',
    name: 'Atlantic Pioneer',
    type: 'RoRo',
    imo: 'IMO 9543210',
    flag: 'Norway',
    yearBuilt: 2012,
    description: 'Roll-on/roll-off vessel for vehicle transport',
    status: 'Inactive',
    lastMaintenance: new Date('2022-11-10').toISOString()
  }
];

export const ShipsProvider = ({ children }) => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShips = async () => {
      try {
        setLoading(true);
        const storedShips = getItem('ships');
        
        // If no ships exist in storage, use demo data
        if (storedShips && storedShips.length > 0) {
          setShips(storedShips);
        } else {
          setShips(demoShips);
          setItem('ships', demoShips);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading ships:', err);
        setError('Failed to load ships data');
      } finally {
        setLoading(false);
      }
    };
    
    loadShips();
  }, []);

  const addShip = async (ship) => {
    try {
      const newShip = {
        ...ship,
        id: `s${Date.now()}`,
      };
      const updatedShips = [...ships, newShip];
      setShips(updatedShips);
      setItem('ships', updatedShips);
      toast.success('Ship added successfully');
      return newShip;
    } catch (err) {
      console.error('Error adding ship:', err);
      toast.error('Failed to add ship');
      throw err;
    }
  };

  const updateShip = async (id, updates) => {
    try {
      const shipExists = ships.some(ship => ship.id === id);
      if (!shipExists) {
        throw new Error(`Ship with ID ${id} not found`);
      }
      
      const updatedShips = ships.map((ship) =>
        ship.id === id ? { ...ship, ...updates } : ship
      );
      setShips(updatedShips);
      setItem('ships', updatedShips);
      toast.success('Ship updated successfully');
    } catch (err) {
      console.error('Error updating ship:', err);
      toast.error('Failed to update ship');
      throw err;
    }
  };

  const deleteShip = async (id) => {
    try {
      const shipExists = ships.some(ship => ship.id === id);
      if (!shipExists) {
        throw new Error(`Ship with ID ${id} not found`);
      }
      
      const updatedShips = ships.filter((ship) => ship.id !== id);
      setShips(updatedShips);
      setItem('ships', updatedShips);
      toast.success('Ship deleted successfully');
    } catch (err) {
      console.error('Error deleting ship:', err);
      toast.error('Failed to delete ship');
      throw err;
    }
  };

  const getShipById = (id) => {
    return ships.find((ship) => ship.id === id);
  };

  const searchShips = (query, filters = {}) => {
    if (!query && Object.keys(filters).length === 0) {
      return ships;
    }
    
    const searchTerm = query ? query.toLowerCase() : '';
    
    return ships.filter((ship) => {
      // Search term matching
      const matchesSearch = !searchTerm || 
        ship.name?.toLowerCase().includes(searchTerm) ||
        ship.imo?.toLowerCase().includes(searchTerm) ||
        ship.flag?.toLowerCase().includes(searchTerm) ||
        ship.description?.toLowerCase().includes(searchTerm);
      
      // Filter matching
      const matchesStatus = !filters.status || ship.status === filters.status;
      const matchesType = !filters.type || ship.type === filters.type;
      const matchesYear = !filters.yearBuilt || ship.yearBuilt === filters.yearBuilt;
      const matchesFlag = !filters.flag || ship.flag === filters.flag;
      
      return matchesSearch && matchesStatus && matchesType && matchesYear && matchesFlag;
    });
  };
  
  const sortShips = (shipsToSort, sortKey, sortDirection) => {
    if (!sortKey) return shipsToSort;
    
    return [...shipsToSort].sort((a, b) => {
      // Handle null values
      if (!a[sortKey] && !b[sortKey]) return 0;
      if (!a[sortKey]) return 1;
      if (!b[sortKey]) return -1;
      
      // Special case for dates
      if (sortKey === 'lastMaintenance') {
        const dateA = new Date(a[sortKey]);
        const dateB = new Date(b[sortKey]);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default string comparison
      const aValue = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : a[sortKey];
      const bValue = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : b[sortKey];
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const value = {
    ships,
    loading,
    error,
    addShip,
    updateShip,
    deleteShip,
    getShipById,
    searchShips,
    sortShips
  };

  return (
    <ShipsContext.Provider value={value}>
      {children}
    </ShipsContext.Provider>
  );
};

export const useShips = () => {
  const context = useContext(ShipsContext);
  if (!context) {
    throw new Error('useShips must be used within a ShipsProvider');
  }
  return context;
}; 