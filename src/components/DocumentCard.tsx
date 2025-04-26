import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Document as DocumentType } from '../contexts/DocumentContext';

interface DocumentCardProps {
  document: DocumentType;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getStatusBadge = (status: DocumentType['status'], signers: DocumentType['signers']) => {
    const allSigned = signers.every(signer => signer.signature);
    
    if (allSigned) {
      return <span className="badge bg-success-50 text-success-700">Completed</span>;
    }
    
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning-50 text-warning-700">Pending</span>;
      case 'signed':
        return <span className="badge bg-primary-100 text-primary-800">Signed</span>;
      case 'expired':
        return <span className="badge bg-error-50 text-error-700">Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-primary-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <FileText className="h-5 w-5 text-primary-700" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">{document.title}</h3>
            <p className="text-sm text-neutral-500">{document.description}</p>
          </div>
        </div>
        {getStatusBadge(document.status, document.signers)}
      </div>

      {document.signers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-neutral-500 mb-2">Signers</p>
          <div className="space-y-2">
            {document.signers.map((signer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium overflow-hidden">
                    {signer.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm">{signer.email}</span>
                </div>
                <div>
                  {signer.signature ? (
                    <span className="text-xs text-success-700 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Signed
                    </span>
                  ) : (
                    <span className="text-xs text-warning-700 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
        <Link 
          to={`/documents/${document.id}`}
          className="text-xs text-primary-700 hover:text-primary-800 font-medium"
        >
          View details
        </Link>
        
        <div className="flex space-x-2">
          {!document.signers.every(signer => signer.signature) && (
            <Link 
              to={`/sign/${document.id}`}
              className="btn btn-primary text-xs py-1 px-3"
            >
              Sign
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;