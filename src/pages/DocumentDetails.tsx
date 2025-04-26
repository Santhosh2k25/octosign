import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Trash2, User, Check, X, Share2 } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import ShareDocumentModal from '../components/ShareDocumentModal';
// import type { Document } from '../contexts/DocumentContext';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, deleteDocument } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  
  const document = getDocument(id || '');
  
  if (!document) {
    return (
      <div className="max-w-7xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Document Not Found</h2>
          <p className="text-neutral-600 mb-4">The document you're looking for doesn't exist or has been deleted.</p>
          <Link to="/documents" className="btn btn-primary">
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = document.ownerEmail === user?.email;

  const handleDownload = () => {
    // Download the first file from the document
    if (document.files && document.files.length > 0) {
      const file = document.files[0];
      const url = URL.createObjectURL(file);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = file.name || document.title;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert('No files available for download.');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone and all users who have access to this document will no longer be able to view it.')) {
      if (id) {
        deleteDocument(id);
        navigate('/documents');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/documents')}
          className="text-neutral-600 hover:text-neutral-900 mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Document Details</h1>
          <p className="text-neutral-600">View and manage document information</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{document.title}</h2>
                <p className="text-neutral-600 mt-1">{document.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`badge ${
                    document.status === 'pending' ? 'badge-yellow' :
                    document.status === 'signed' ? 'badge-green' :
                    'badge-red'
                  }`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                  <p className="text-sm text-neutral-500">
                    Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                  {!isOwner && (
                    <p className="text-sm text-primary-600 flex items-center">
                      <Share2 className="h-3 w-3 mr-1" />
                      Shared with you
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="btn btn-outline flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-outline text-error-600 hover:bg-error-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Document Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Document Type</p>
                  <p className="text-neutral-900">{document.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">Files</p>
                  <p className="text-neutral-900">{document.files.length} file{document.files.length !== 1 ? 's' : ''}</p>
                </div>
                {isOwner && document.sharedWith && document.sharedWith.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Shared With</p>
                    <div className="mt-1">
                      {document.sharedWith.map((email, index) => (
                        <div key={index} className="flex items-center text-sm text-neutral-900">
                          <User className="h-4 w-4 mr-2 text-neutral-500" />
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Signers</h3>
              <div className="space-y-3">
                {document.signers.map((signer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-primary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{signer.email}</p>
                        <p className="text-sm text-neutral-500">{signer.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {signer.signature ? (
                        <span className="text-green-600">
                          <Check className="h-5 w-5" />
                        </span>
                      ) : (
                        <span className="text-neutral-400">
                          <X className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showShareModal && (
        <ShareDocumentModal 
          documentId={document.id} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
};

export default DocumentDetails; 