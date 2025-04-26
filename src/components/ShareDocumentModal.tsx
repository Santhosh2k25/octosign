import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';

interface ShareDocumentModalProps {
  documentId: string;
  onClose: () => void;
}

const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({ documentId, onClose }) => {
  const { shareDocument, getDocument } = useDocuments();
  const [email, setEmail] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const document = getDocument(documentId);
  
  const handleShare = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if the email is already a signer
    if (document?.signers.some(signer => signer.email === email)) {
      setError('This person is already a signer on this document');
      return;
    }
    
    // Share the document
    shareDocument(documentId, email);
    setIsShared(true);
    setError(null);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setEmail('');
      setIsShared(false);
    }, 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Share Document</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-neutral-600 mb-2">
            Share this document with another user. They will be able to view and sign the document.
          </p>
          <p className="text-sm text-neutral-500">
            Document: <span className="font-medium">{document?.title}</span>
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {isShared && (
          <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-lg text-sm flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Document shared successfully!
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email Address
          </label>
          <div className="flex">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1 rounded-r-none"
              placeholder="Enter email address"
            />
            <button
              onClick={handleShare}
              className="btn btn-primary rounded-l-none flex items-center"
              disabled={!email || isShared}
            >
              <Send className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal; 