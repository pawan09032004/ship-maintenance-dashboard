import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShips } from '../../contexts/ShipsContext';
import { useComponents } from '../../contexts/ComponentsContext';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShipDetail = () => {
  const { id } = useParams();
  const { getShipById } = useShips();
  const { getComponentsByShipId } = useComponents();
  const [ship, setShip] = useState(null);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const shipData = getShipById(id);
    if (shipData) {
      setShip(shipData);
      const shipComponents = getComponentsByShipId(id);
      setComponents(shipComponents);
    } else {
      toast.error('Ship not found');
    }
  }, [id, getShipById, getComponentsByShipId]);

  if (!ship) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#111827]">{ship.name}</h1>
          <Link
            to={`/ships/${id}/edit`}
            className="btn btn-primary flex items-center"
          >
            <FiEdit2 className="mr-2" />
            Edit Ship
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-[#111827] mb-4">
                Ship Information
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">IMO Number</dt>
                  <dd className="mt-1 text-sm text-[#111827]">{ship.imo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Flag</dt>
                  <dd className="mt-1 text-sm text-[#111827]">{ship.flag}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ship.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : ship.status === 'Under Maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ship.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-[#111827]">Components</h2>
            <Link
              to={`/components/new?shipId=${id}`}
              className="btn btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Component
            </Link>
          </div>

          {components.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Installation Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Maintenance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {components.map((component) => (
                    <tr key={component.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/components/${component.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {component.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {component.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(component.installDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          component.lastMaintenanceDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/components/${component.id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <FiEdit2 className="inline-block" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No components found for this ship.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipDetail; 