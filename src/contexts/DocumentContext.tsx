import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Signer {
  email: string;
  role: string;
  signature?: string | { name: string; style: string } | 'aadhaar' | 'dsc';
}

export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'signed' | 'expired';
  uploadedAt: string;
  signedAt?: string;
  signers: Signer[];
  files: File[];
  ownerEmail?: string; // Email of the user who created the document
  sharedWith?: string[]; // Array of emails the document is shared with
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => void;
  updateDocumentStatus: (id: string, status: Document['status'], signature?: Signer['signature']) => void;
  getDocument: (id: string) => Document | undefined;
  deleteDocument: (id: string) => void;
  shareDocument: (id: string, email: string) => void;
  getSharedDocuments: () => Document[];
  getMyDocuments: () => Document[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      try {
        const parsed = JSON.parse(savedDocuments);
        // Convert stored file data back to File objects with content
        return parsed.map((doc: any) => ({
          ...doc,
          files: doc.files.map((fileData: any) => {
            // Create a new File object with the stored content
            const file = new File(
              [Uint8Array.from(atob(fileData.content), c => c.charCodeAt(0))],
              fileData.name,
              { type: fileData.type }
            );
            Object.defineProperty(file, 'size', { value: fileData.size });
            return file;
          })
        }));
      } catch (error) {
        console.error('Error parsing documents from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Save documents to localStorage whenever they change
  useEffect(() => {
    try {
      // Convert File objects to serializable data including content
      const serializableDocuments = documents.map(doc => ({
        ...doc,
        files: doc.files.map(async file => {
          // Read file content and convert to base64
          const arrayBuffer = await file.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64Content
          };
        })
      }));

      // Wait for all file content to be processed
      Promise.all(serializableDocuments.map(async doc => ({
        ...doc,
        files: await Promise.all(doc.files)
      }))).then(processedDocs => {
        localStorage.setItem('documents', JSON.stringify(processedDocs));
      });
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
    }
  }, [documents]);

  const addDocument = (document: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      ownerEmail: user?.email || '',
      sharedWith: [],
    };
    setDocuments(prev => [...prev, newDocument]);
  };

  const updateDocumentStatus = (id: string, status: Document['status'], signature?: Signer['signature']) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            status,
            // for analytics
            signedAt: status === 'signed' ? new Date().toISOString() : doc.signedAt,
            signers: doc.signers.map(signer => {
              if (signer.email === user?.email) {
                return { ...signer, signature };
              }
              return signer;
            })
          };
        }
        return doc;
      })
    );
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const deleteDocument = (id: string) => {
    // Get the document before deleting it
    const documentToDelete = documents.find(doc => doc.id === id);
    
    if (!documentToDelete) return;
    
    // Check if the current user is the owner of the document
    if (documentToDelete.ownerEmail !== user?.email) {
      console.error('Only the document owner can delete the document');
      return;
    }
    
    // Remove the document from the documents array
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    // In a real application, you would also:
    // 1. Delete the document from the backend database
    // 2. Notify all users who have access to this document that it has been deleted
    // 3. Remove any cached versions of the document
    
    console.log(`Document "${documentToDelete.title}" has been deleted. All users who had access to this document will no longer be able to view it.`);
  };

  const shareDocument = (id: string, email: string) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          // Check if the email is already in the sharedWith array
          if (!doc.sharedWith?.includes(email)) {
            return {
              ...doc,
              sharedWith: [...(doc.sharedWith || []), email]
            };
          }
        }
        return doc;
      })
    );
  };

  const getSharedDocuments = () => {
    if (!user?.email) return [];
    return documents.filter(doc => 
      // Only include documents where the user is not the owner
      doc.ownerEmail !== user.email && 
      // And either the user is in the sharedWith array or is a signer
      (doc.sharedWith?.includes(user.email) || 
       doc.signers.some(signer => signer.email === user.email))
    );
  };

  const getMyDocuments = () => {
    if (!user?.email) return [];
    return documents.filter(doc => doc.ownerEmail === user.email);
  };

  return (
    <DocumentContext.Provider value={{ 
      documents, 
      addDocument, 
      updateDocumentStatus, 
      getDocument, 
      deleteDocument,
      shareDocument,
      getSharedDocuments,
      getMyDocuments
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}; 