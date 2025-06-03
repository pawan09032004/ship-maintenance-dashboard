import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiAnchor,
  FiSettings,
  FiTool,
  FiCalendar,
  FiBarChart2,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: FiHome },
    { name: 'Ships', to: '/ships', icon: FiAnchor },
    { name: 'Components', to: '/components', icon: FiSettings },
    { name: 'Maintenance Jobs', to: '/jobs', icon: FiTool },
    { name: 'Calendar', to: '/calendar', icon: FiCalendar },
    { name: 'Reports', to: '/reports', icon: FiBarChart2 },
  ];

  const isAdmin = user?.role === 'Admin';
  const isInspector = user?.role === 'Inspector';
  const isEngineer = user?.role === 'Engineer';

  const filteredNavigation = navigation.filter((item) => {
    if (isAdmin) return true;
    if (isInspector) return ['Dashboard', 'Ships', 'Components', 'Reports'].includes(item.name);
    if (isEngineer) return ['Dashboard', 'Maintenance Jobs', 'Calendar'].includes(item.name);
    return false;
  });

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#111827]'
                    }`
                  }
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 ${
                      location.pathname === item.to
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 