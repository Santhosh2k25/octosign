import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Eye, Download, Trash2, PenSquare, Share2 } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const Documents: React.FC = () => {
  const { documents, deleteDocument, getSharedDocuments, getMyDocuments } = useDocuments();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFilter, setDocumentFilter] = useState<'all' | 'my' | 'shared'>('all');
  const navigate = useNavigate();

  // Get filtered documents based on the selected filter and user role
  const getFilteredDocuments = () => {
    let filteredDocs = documents;
    
    // If user is not admin, they can only see their own and shared documents
    if (user?.role !== 'admin') {
      // If filter is 'all', show both my documents and shared documents
      if (documentFilter === 'all') {
        const myDocs = getMyDocuments();
        const sharedDocs = getSharedDocuments();
        filteredDocs = [...myDocs, ...sharedDocs];
      } else if (documentFilter === 'my') {
        filteredDocs = getMyDocuments();
      } else if (documentFilter === 'shared') {
        filteredDocs = getSharedDocuments();
      }
    } else {
      // Admin can see all documents or filter as requested
      if (documentFilter === 'my') {
        filteredDocs = getMyDocuments();
      } else if (documentFilter === 'shared') {
        filteredDocs = getSharedDocuments();
      }
      // 'all' filter shows all documents for admin
    }
    
    // Apply search filter
    return filteredDocs.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredDocuments = getFilteredDocuments();

  const handleViewDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const [downloadError, setDownloadError] = useState<string | null>(null);
  const handleDownloadDocument = async (doc: any) => {
    try {
      setDownloadError(null);
      
      // Get the first file from the document
      if (doc.files && doc.files.length > 0) {
        const file = doc.files[0];
        
        // Create a temporary link element
        const link = document.createElement('a');
        // Create an object URL from the file
        const url = URL.createObjectURL(file);
        link.href = url;
        link.download = file.name || doc.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(url);
      } else {
        setDownloadError('No files available for download.');
        setTimeout(() => setDownloadError(null), 3000);
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to download document. Please try again.');
      // Clear error message after 3 seconds
      setTimeout(() => setDownloadError(null), 3000);
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Documents</h1>
          <p className="text-neutral-600">
            {user?.role === 'admin' 
              ? 'View and manage all documents' 
              : 'View and manage your documents'}
          </p>
        </div>
        <Link 
          to="/upload" 
          className="btn btn-primary"
        >
          Upload New Document
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex rounded-md shadow-sm">
                <button 
                  onClick={() => setDocumentFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    documentFilter === 'all' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {user?.role === 'admin' ? 'All Documents' : 'All Documents'}
                </button>
                <button 
                  onClick={() => setDocumentFilter('my')}
                  className={`px-4 py-2 text-sm font-medium ${
                    documentFilter === 'my' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  My Documents
                </button>
                <button 
                  onClick={() => setDocumentFilter('shared')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    documentFilter === 'shared' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  Shared With Me
                </button>
              </div>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No documents found</h3>
              <p className="text-neutral-600 mb-4">
                {documentFilter === 'all' 
                  ? user?.role === 'admin' 
                    ? 'No documents in the system yet' 
                    : 'Upload your first document to get started' 
                  : documentFilter === 'my' 
                    ? 'You haven\'t created any documents yet' 
                    : 'No documents have been shared with you yet'}
              </p>
              {documentFilter !== 'shared' && (
                <Link to="/upload" className="btn btn-primary">
                  Upload Document
                </Link>
              )}
            </div>
          ) : (
            <>
              {downloadError && (
                <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg">
                  {downloadError}
                </div>
              )}
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-primary-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{doc.title}</h3>
                        <p className="text-sm text-neutral-500">{doc.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-neutral-400">
                            {doc.files.length} file{doc.files.length !== 1 ? 's' : ''}
                          </p>
                          <span className="text-neutral-300">•</span>
                          <p className="text-xs text-neutral-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          <span className="text-neutral-300">•</span>
                          <p className="text-xs text-neutral-400">
                            {doc.signers.length} signer{doc.signers.length !== 1 ? 's' : ''}
                          </p>
                          {doc.ownerEmail !== user?.email && (
                            <>
                              <span className="text-neutral-300">•</span>
                              <p className="text-xs text-primary-600 flex items-center">
                                <Share2 className="h-3 w-3 mr-1" />
                                Shared
                              </p>
                            </>
                          )}
                          {user?.role === 'admin' && doc.ownerEmail !== user?.email && (
                            <>
                              <span className="text-neutral-300">•</span>
                              <p className="text-xs text-neutral-400">
                                Owner: {doc.ownerEmail}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge ${
                        doc.status === 'pending' ? 'badge-yellow' :
                        doc.status === 'signed' ? 'badge-green' :
                        'badge-red' 
                      }`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      {!doc.signers.every(signer => signer.signature) && (
                        <Link 
                          to={`/sign/${doc.id}`}
                          className="btn btn-primary text-sm py-1 px-3 flex items-center gap-1"
                        >
                          <PenSquare className="h-4 w-4" />
                          <span>Sign Now</span>
                        </Link>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(doc.id)}
                          className="text-neutral-400 hover:text-primary-600 transition-colors"
                          title="View Document"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-neutral-400 hover:text-primary-600 transition-colors"
                          title="Download Document"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        {(doc.ownerEmail === user?.email || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-neutral-400 hover:text-error-600 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
