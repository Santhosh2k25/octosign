import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Check if the logged-in user is an admin
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError('Failed to get user information');
        setIsLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (userData?.role !== 'admin') {
        await signOut(auth);
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center">
            <div className="bg-primary-700 text-white p-1 rounded">
              <Shield className="w-6 h-6" />
            </div>
            <span className="ml-2 text-xl font-semibold text-primary-800">Admin Portal</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">Admin Login</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Access restricted to administrators only
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
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
                Sign in as Admin
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-700 hover:text-primary-800">
              Return to regular login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 