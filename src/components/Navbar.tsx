import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    await markAsRead(notificationId);
    setShowNotifications(false);
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <nav className="bg-gray-300 shadow-sm fixed top-0 left-0 right-0 z-40">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="mr-2 md:hidden rounded p-1 hover:bg-neutral-100"
          >
            <Menu className="h-6 w-6 text-neutral-700" />
          </button>
          
          <Link to="/dashboard" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-700 text-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-primary-800">OctoGSign</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1  rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
              )}
            </button>
            
            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-neutral-500">No notifications</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button 
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id, notification.link)}
                          className={`w-full text-left block px-4 py-3 hover:bg-neutral-50 border-l-2 ${
                            notification.isRead 
                              ? 'border-transparent' 
                              : notification.type === 'success' 
                                ? 'border-success-500' 
                                : notification.type === 'warning'
                                  ? 'border-warning-500'
                                  : notification.type === 'error'
                                    ? 'border-error-500'
                                    : 'border-primary-500'
                          }`}
                        >
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                            <p className="text-xs text-neutral-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">{notification.message}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-neutral-200">
                    <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-800">
                      View all notifications
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-neutral-700">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>
            
            {showProfileMenu && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    role="menuitem"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;