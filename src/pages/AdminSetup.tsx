import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  
  const { register, setUserAsAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkExistingAdmin = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'admin'));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setAdminExists(true);
          setError('An admin account already exists. Only one admin is allowed.');
        }
      } catch (err) {
        console.error('Error checking for admin:', err);
      }
    };
    
    checkExistingAdmin();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (adminExists) {
        throw new Error('An admin account already exists. Only one admin is allowed.');
      }
      
      // Register the new user
      await register(name, email, password);
      
      // Get the current user's ID
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Failed to get user information');
      }
      
      // Set the user as admin
      await setUserAsAdmin(userId);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err: any) {
      console.error('Admin setup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(`Failed to create admin account: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="bg-primary-700 text-white p-1 rounded">
                <Shield className="w-6 h-6" />
              </div>
              <span className="ml-2 text-xl font-semibold text-primary-800">Admin Setup</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">Admin Already Exists</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Only one admin account is allowed in the system.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              An admin account already exists. Please contact the existing admin for access.
            </div>
            
            <div className="mt-6 text-center">
              <a href="/admin/login" className="text-sm text-primary-700 hover:text-primary-800">
                Go to Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="bg-primary-700 text-white p-1 rounded">
              <Shield className="w-6 h-6" />
            </div>
            <span className="ml-2 text-xl font-semibold text-primary-800">Admin Setup</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">Create Admin Account</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Set up the first administrator account
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md text-sm">
              Admin account created successfully! Redirecting to login...
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-1"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1"
                placeholder="Enter admin email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1"
                placeholder="Enter password"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-2 px-4 flex justify-center items-center"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Create Admin Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup; 