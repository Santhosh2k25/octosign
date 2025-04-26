import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, X, Plus, FileText, User, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDocuments } from '../contexts/DocumentContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Contact {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role?: string;
}

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const { addDocument } = useDocuments();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState('contract');
  const [language, setLanguage] = useState('english');
  const [expiryDate, setExpiryDate] = useState('');
  const [signers, setSigners] = useState([{ email: '', role: 'signer' }]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  // Fetch contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;
      
      setIsLoadingContacts(true);
      try {
        const contactsRef = collection(db, 'users', user.id, 'contacts');
        const snapshot = await getDocs(contactsRef);
        
        const fetchedContacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Contact[];
        
        setContacts(fetchedContacts);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    fetchContacts();
  }, [user]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileArray = Array.from(event.target.files);
      setFiles([...files, ...fileArray]);
    }
  };
  
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    if (event.dataTransfer.files) {
      const fileArray = Array.from(event.dataTransfer.files);
      setFiles([...files, ...fileArray]);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const addSigner = () => {
    setSigners([...signers, { email: '', role: 'signer' }]);
  };
  
  const removeSigner = (index: number) => {
    const newSigners = [...signers];
    newSigners.splice(index, 1);
    setSigners(newSigners);
  };
  
  const updateSigner = (index: number, field: 'email' | 'role', value: string) => {
    const newSigners = [...signers];
    newSigners[index] = { ...newSigners[index], [field]: value };
    setSigners(newSigners);
  };
  
  const handleSelectContact = (email: string) => {
    const currentIndex = signers.length - 1;
    updateSigner(currentIndex, 'email', email);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };
  
  const filteredContacts = contacts.filter(
    (contact) => 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'nda', label: 'Non-Disclosure Agreement' },
    { value: 'offer', label: 'Offer Letter' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'other', label: 'Other' }
  ];
  
  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'bengali', label: 'Bengali' }
  ];
  
  const signerRoles = [
    { value: 'signer', label: 'Signer' },
    { value: 'reviewer', label: 'Reviewer' },
    { value: 'approver', label: 'Approver' },
    { value: 'cc', label: 'CC (Receives a Copy)' }
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Process files to ensure they are properly loaded
      const processedFiles = await Promise.all(files.map(async file => {
        // Create a new File object with the same content
        const arrayBuffer = await file.arrayBuffer();
        return new File([arrayBuffer], file.name, { type: file.type });
      }));

      // Create a new document object
      const newDocument = {
        title: documentTitle,
        description: documentDescription,
        type: documentType,
        status: 'pending' as const,
        uploadedAt: new Date().toISOString(),
        signers: signers,
        files: processedFiles,
        ownerEmail: user?.email || '',
        sharedWith: []
      };

      // Add document to context
      addDocument(newDocument);
      
      // Show success message
      alert('Document uploaded successfully!');
      
      // Navigate to documents page
      navigate('/documents');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Upload Document</h1>
          <p className="text-neutral-600">Upload documents for signature and approval</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* File Upload Section */}
              <div>
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Upload Files</h2>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    multiple
                  />
                  
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-neutral-400 mb-3" />
                    <p className="text-lg font-medium text-neutral-900 mb-1">
                      Drag & drop files or <span className="text-primary-700">browse</span>
                    </p>
                    <p className="text-sm text-neutral-500 mb-3">
                      Supported formats: PDF, Word, Excel, PowerPoint, Text
                    </p>
                    <p className="text-xs text-neutral-400">Max file size: 25MB</p>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-200"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-neutral-500 mr-3" />
                          <div>
                            <p className="font-medium text-neutral-800">{file.name}</p>
                            <p className="text-xs text-neutral-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-neutral-400 hover:text-error-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Document Details Section */}
              <div>
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Document Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                      Document Title <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="input"
                      placeholder="Enter document title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="document-type" className="block text-sm font-medium text-neutral-700 mb-1">
                      Document Type
                    </label>
                    <select
                      id="document-type"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="input"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-neutral-700 mb-1">
                      Language
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="input"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="expiry-date" className="block text-sm font-medium text-neutral-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiry-date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Enter a brief description of the document"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Signers Section */}
              <div>
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Add Signers</h2>
                
                {/* Current user as a signer */}
                <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user?.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-neutral-800">{user?.name} (You)</p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="badge badge-blue">Owner</span>
                    </div>
                  </div>
                </div>
                
                {/* Signers list */}
                <div className="space-y-4">
                  {signers.map((signer, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white rounded-lg border border-neutral-200 flex flex-col md:flex-row md:items-center gap-4"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Email Address <span className="text-error-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={signer.email}
                            onChange={(e) => updateSigner(index, 'email', e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
                            className="input pr-10"
                            placeholder="Enter email address"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          
                          {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                              <div className="py-1">
                                {isLoadingContacts ? (
                                  <div className="px-4 py-2 text-sm text-neutral-500">Loading contacts...</div>
                                ) : filteredContacts.length > 0 ? (
                                  filteredContacts.map((contact) => (
                                    <button
                                      key={contact.id}
                                      type="button"
                                      onClick={() => handleSelectContact(contact.email)}
                                      className="w-full text-left px-4 py-2 hover:bg-neutral-100 flex items-center"
                                    >
                                      <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium overflow-hidden mr-2">
                                        {contact.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{contact.name}</p>
                                        <p className="text-xs text-neutral-500">{contact.email}</p>
                                      </div>
                                      {signer.email === contact.email && (
                                        <Check className="h-4 w-4 text-primary-700 ml-auto" />
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-4 py-2 text-sm text-neutral-500">No contacts found</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Role
                        </label>
                        <select
                          value={signer.role}
                          onChange={(e) => updateSigner(index, 'role', e.target.value)}
                          className="input"
                        >
                          {signerRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSigner(index)}
                          className="text-neutral-400 hover:text-error-500 self-end md:self-center"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addSigner}
                  className="mt-4 flex items-center text-primary-700 hover:text-primary-800 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another Signer
                </button>
              </div>
              
              {/* Actions */}
              <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Link 
                  to="/dashboard" 
                  className="btn btn-outline"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={files.length === 0 || !documentTitle}
                >
                  Upload & Continue
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;