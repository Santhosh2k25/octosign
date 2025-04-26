import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  Users, 
  BarChart3,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../contexts/DocumentContext';
import DocumentCard from '../components/DocumentCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { documents, getMyDocuments, getSharedDocuments } = useDocuments();
  
  // Get recent documents based on user role
  const getRecentDocuments = () => {
    let filteredDocs = documents;
    
    // If user is not admin, they can only see their own and shared documents
    if (user?.role !== 'admin') {
      const myDocs = getMyDocuments();
      const sharedDocs = getSharedDocuments();
      filteredDocs = [...myDocs, ...sharedDocs];
    }
    
    // Sort documents by upload date (most recent first) and take the first 4
    return [...filteredDocs]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 4);
  };
  
  const recentDocuments = getRecentDocuments();
  
  // Calculate stats based on user role
  const getStats = () => {
    let docsToCount = documents;
    
    // If user is not admin, only count their own and shared documents
    if (user?.role !== 'admin') {
      const myDocs = getMyDocuments();
      const sharedDocs = getSharedDocuments();
      docsToCount = [...myDocs, ...sharedDocs];
    }
    
    return [
      { 
        title: 'Total Documents', 
        value: docsToCount.length, 
        icon: <FileText className="h-5 w-5 text-primary-700" />,
        color: 'bg-primary-50 text-primary-700' 
      },
      { 
        title: 'Pending Signatures', 
        value: docsToCount.filter(d => !d.signers.every(signer => signer.signature)).length, 
        icon: <Clock className="h-5 w-5 text-warning-500" />,
        color: 'bg-warning-50 text-warning-700' 
      },
      { 
        title: 'Completed', 
        value: docsToCount.filter(d => d.signers.every(signer => signer.signature)).length, 
        icon: <CheckCircle className="h-5 w-5 text-success-500" />,
        color: 'bg-success-50 text-success-700' 
      },
    ];
  };
  
  const stats = getStats();

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {user?.name?.split(' ')[0] || 'User'}</p>
        </div>
        
        <Link to="/upload" className="btn btn-primary flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Document
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              {user?.role === 'admin' ? 'Recent Documents' : 'Recent Documents'}
            </h2>
            <Link to="/documents" className="text-primary-700 hover:text-primary-800 text-sm font-medium">
              View all
            </Link>
          </div>
          
          {recentDocuments.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 text-center">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No documents yet</h3>
              <p className="text-neutral-600 mb-4">
                {user?.role === 'admin' 
                  ? 'No documents have been uploaded to the system yet' 
                  : 'You haven\'t created or received any documents yet'}
              </p>
              <Link to="/upload" className="btn btn-primary">
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-900">Actions</h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Link 
              to="/upload"
              className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-primary-300 hover:shadow transition-all flex items-center"
            >
              <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
                <Upload className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900">Upload Document</p>
                <p className="text-xs text-neutral-500">Upload a new document for signing</p>
              </div>
            </Link>
            
            <Link 
              to="/contacts"
              className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-primary-300 hover:shadow transition-all flex items-center"
            >
              <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900">Manage Contacts</p>
                <p className="text-xs text-neutral-500">Add or edit your contacts</p>
              </div>
            </Link>
            
            <Link 
              to="/analytics"
              className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-primary-300 hover:shadow transition-all flex items-center"
            >
              <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900">View Analytics</p>
                <p className="text-xs text-neutral-500">Document signing statistics</p>
              </div>
            </Link>
          </div>
          
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <h3 className="text-lg font-medium text-primary-800">Need assistance?</h3>
            <p className="text-sm text-primary-700 mt-1 mb-3">
              Our help center provides guides on how to use TrustSign effectively.
            </p>
            <Link 
              to="/support"
              className="text-sm font-medium text-primary-700 hover:text-primary-800 flex items-center"
            >
              Visit Help Center
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;