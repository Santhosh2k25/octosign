import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User,  Bell,  Globe, Save } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    documentUpdates: true,
    securityAlerts: true
  });

  // Load user settings from database on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return;
      
      try {
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || user?.name || '');
          setEmail(userData.email || user?.email || '');
          setPhone(userData.phone || user?.phone || '');
          setLanguage(userData.settings?.language || 'en');
          setNotifications(userData.settings?.notifications || {
            email: true,
            push: true,
            documentUpdates: true,
            securityAlerts: true
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        setErrorMessage('Failed to load settings. Please refresh the page.');
      }
    };

    loadUserSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) {
      setErrorMessage('User session not found. Please try logging in again.');
      return;
    }
    
    // Validate required fields
    if (!name.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name,
        phone,
        // Note: email typically can't be changed directly through this interface
        // as it often requires re-authentication
        settings: {
          language,
          notifications,
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      
      setSuccessMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      if (error instanceof Error) {
        setErrorMessage(`Failed to save settings: ${error.message}`);
      } else {
        setErrorMessage('Failed to save settings. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-neutral-600">Manage your account settings and preferences</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 divide-y divide-neutral-200">
        {/* Profile Settings */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-primary-700 mr-2" />
            <h2 className="text-lg font-medium text-neutral-900">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-primary-700 mr-2" />
            <h2 className="text-lg font-medium text-neutral-900">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="email-notifications" className="text-sm font-medium text-neutral-700">
                  Email Notifications
                </label>
                <p className="text-sm text-neutral-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                id="email-notifications"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="push-notifications" className="text-sm font-medium text-neutral-700">
                  Push Notifications
                </label>
                <p className="text-sm text-neutral-500">Receive push notifications in browser</p>
              </div>
              <input
                type="checkbox"
                id="push-notifications"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="document-updates" className="text-sm font-medium text-neutral-700">
                  Document Updates
                </label>
                <p className="text-sm text-neutral-500">Get notified about document changes</p>
              </div>
              <input
                type="checkbox"
                id="document-updates"
                checked={notifications.documentUpdates}
                onChange={(e) => setNotifications({ ...notifications, documentUpdates: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="security-alerts" className="text-sm font-medium text-neutral-700">
                  Security Alerts
                </label>
                <p className="text-sm text-neutral-500">Get notified about security events</p>
              </div>
              <input
                type="checkbox"
                id="security-alerts"
                checked={notifications.securityAlerts}
                onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-primary-700 mr-2" />
            <h2 className="text-lg font-medium text-neutral-900">Language Settings</h2>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-neutral-700">
              Interface Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="btn btn-primary flex items-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings; 