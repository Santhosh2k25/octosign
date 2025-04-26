import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Clock, 
  Users, 
  BarChart, 
  Settings, 
  HelpCircle,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={30} />, path: '/dashboard' },
    { name: 'Documents', icon: <FileText size={30} />, path: '/documents' },
    { name: 'Upload', icon: <Upload size={30} />, path: '/upload' },
    { name: 'History', icon: <Clock size={30} />, path: '/history' },
    { name: 'Contacts', icon: <Users size={30} />, path: '/contacts' },
    { name: 'Analytics', icon: <BarChart size={30} />, path: '/analytics' },
  ];
  
  const bottomNavItems = [
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { name: 'Help & Support', icon: <HelpCircle size={20} />, path: '/support' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 mt-12 left-0 z-20 h-full w-64 bg-gray-300 shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-700 text-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                <span className="text-xl font-semibold text-primary-800">OctoGSign</span>
              </div>
              <span className="text-xl font-semibold text-primary-800">TrustSign</span>
            </div>
          </Link>
          
          <button 
            onClick={onClose}
            className="md:hidden rounded p-1 hover:bg-neutral-100"
          >
            <X className="h-6 w-6 text-neutral-700" />
          </button>
        </div> */}
        
        <div className="py-4 h-full flex flex-col">
          <nav className="flex-1">
            <ul className="px-3 space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="px-3 py-4 border-t border-neutral-200">
            <ul className="space-y-1">
              {bottomNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="px-4 py-3 mt-auto mb-8">
            <div className="bg-primary-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-primary-800">Need help?</h5>
              <p className="text-xs text-primary-600 mt-1">Check our documentation or contact support.</p>
              <Link 
                to="/support"
                className="mt-2 text-xs font-medium text-primary-700 hover:text-primary-800 flex items-center"
              >
                Get Support
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;