import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Eye,
  Check,
  Shield,
  HelpCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useDocuments, Signer } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import SignaturePad from 'react-signature-canvas';

// Custom wrapper for SignaturePad to use passive event listeners
const PassiveSignaturePad = React.forwardRef<SignaturePad, React.ComponentProps<typeof SignaturePad>>((props, ref) => {
  // Create a container div that will hold the SignaturePad
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Add passive event listeners to the container
      const container = containerRef.current;
      
      const handleTouchStart = () => {
        // This is a no-op handler that just marks the event as passive
      };
      
      const handleTouchMove = () => {
        // This is a no-op handler that just marks the event as passive
      };
      
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, []);
  
  return (
    <div ref={containerRef} className="signature-pad-container">
      <SignaturePad ref={ref} {...props} />
    </div>
  );
});

PassiveSignaturePad.displayName = 'PassiveSignaturePad';

type SignMethod = 'draw' | 'type' | 'upload' | 'aadhaar' | 'dsc';

const DocumentSign: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { getDocument, updateDocumentStatus } = useDocuments();
  const { user } = useAuth();
  const sigPadRef = useRef<SignaturePad>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [signMethod, setSignMethod] = useState<SignMethod>('draw');
  const [typedName, setTypedName] = useState('');
  const [typedStyle, setTypedStyle] = useState('style1');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  
  // Find the document based on the ID
  const document = getDocument(documentId || '');
  
  useEffect(() => {
    if (!document) {
      setError('Document not found');
      setIsLoading(false);
      return;
    }

    if (document.files.length === 0) {
      setError('No files available in the document');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPdfLoadError(false);
    setTotalPages(document.files.length);

    const loadDocument = async () => {
      try {
        const currentFile = document.files[currentPage - 1];
        if (!currentFile) {
          setError('File not found');
          return;
        }

        // Revoke any existing object URL before creating a new one
        if (documentUrl) {
          URL.revokeObjectURL(documentUrl);
        }

        // Create object URL for the current page
        const url = URL.createObjectURL(currentFile);
        setDocumentUrl(url);

        // For PDF files, read the content
        if (currentFile.type === 'application/pdf') {
          try {
            // First try to use the direct URL approach
            setFileContent(url);
            
            // Then try to convert to base64 as a fallback
            const arrayBuffer = await currentFile.arrayBuffer();
            const base64String = btoa(
              String.fromCharCode(...new Uint8Array(arrayBuffer))
            );
            const dataUrl = `data:application/pdf;base64,${base64String}`;
            
            // Store the base64 data in localStorage for persistence across reloads
            try {
              localStorage.setItem(`pdf_${documentId}_${currentPage}`, dataUrl);
            } catch (storageErr) {
              console.warn('Failed to store PDF in localStorage:', storageErr);
            }
          } catch (pdfErr) {
            console.error('Error processing PDF:', pdfErr);
            // Try to retrieve from localStorage if available
            try {
              const storedPdf = localStorage.getItem(`pdf_${documentId}_${currentPage}`);
              if (storedPdf) {
                setFileContent(storedPdf);
              }
            } catch (storageErr) {
              console.warn('Failed to retrieve PDF from localStorage:', storageErr);
            }
          }
        }
      } catch (err) {
        setError('Error loading document');
        console.error('Error loading document:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();

    // Cleanup function
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [document, currentPage, documentId]);
  
  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);
  
  // Check for stored PDF data on component mount
  useEffect(() => {
    if (documentId && currentPage && document?.files[currentPage - 1]?.type === 'application/pdf') {
      try {
        const storedPdf = localStorage.getItem(`pdf_${documentId}_${currentPage}`);
        if (storedPdf) {
          setFileContent(storedPdf);
        }
      } catch (err) {
        console.warn('Failed to retrieve PDF from localStorage:', err);
      }
    }
  }, [documentId, currentPage, document]);
  
  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setHasDrawnSignature(false);
    }
  };
  
  const handleSignatureEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setHasDrawnSignature(true);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleZoomIn = () => {
    if (zoom < 2) {
      setZoom(zoom + 0.1);
    }
  };
  
  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom(zoom - 0.1);
    }
  };
  
  const handleRequestOTP = () => {
    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    // In a real app, this would send an OTP to the user's Aadhaar-linked mobile number
    console.log('Requesting OTP for Aadhaar number:', aadhaarNumber);
    setShowOTPModal(true);
  };
  
  const handleVerifyOTP = () => {
    // In a real app, this would verify the OTP
    console.log('Verifying OTP:', otp);
    setShowOTPModal(false);
    handleCompleteSignature();
  };
  
  const handleCompleteSignature = () => {
    if (!documentId) return;

    let signatureData: Signer['signature'] = '';
    
    if (signMethod === 'draw') {
      if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
        setError('Please draw your signature before completing');
        return;
      }
      signatureData = sigPadRef.current.toDataURL();
    } else if (signMethod === 'type') {
      if (!typedName) {
        setError('Please enter your name before completing');
        return;
      }
      signatureData = {
        name: typedName,
        style: typedStyle
      };
    } else if (signMethod === 'aadhaar') {
      signatureData = 'aadhaar';
    } else if (signMethod === 'dsc') {
      signatureData = 'dsc';
    }

    // Update document status to signed and store signature
    updateDocumentStatus(documentId, 'signed', signatureData);
    
    // Show completion message
    setIsCompleted(true);
  };
  
  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Document Not Found</h2>
          <p className="text-neutral-600 mb-4">The document you're looking for doesn't exist or has been deleted.</p>
          <Link to="/documents" className="btn btn-primary">
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] mt-10">
      <style>
        {`
        .signature-pad-container {
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        `}
      </style>
      {isCompleted ? (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-neutral-200 text-center">
          <div className="bg-success-50 text-success-700 p-3 rounded-full inline-flex mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Document Signed Successfully!</h2>
          <p className="text-neutral-600 mb-6">
            Your signature has been securely added to the document. All parties will be notified once everyone has signed.
          </p>
          
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
            <h3 className="font-medium mb-2">Document Details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Document Name:</span>
              <span className="font-medium">{document.title}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-500">Status:</span>
              <span className="text-success-700 font-medium">Signed by {user?.name || user?.email}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/documents/${document.id}/view`} className="btn btn-outline flex items-center justify-center">
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Link>
            <Link to="/dashboard" className="btn btn-primary flex items-center justify-center">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-full">
          {/* Document Preview */}
          <div className="md:w-2/3 bg-neutral-100 p-4 border-r border-neutral-200">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden h-full flex flex-col">
              {/* Document Toolbar */}
              <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="mx-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center">
                  <button 
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <span className="mx-2 text-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button 
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}
                    className="p-1 rounded hover:bg-neutral-200 disabled:opacity-50"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  <button className="p-1 rounded hover:bg-neutral-200 ml-2">
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button 
                    className="p-1 rounded hover:bg-neutral-200 ml-2"
                    onClick={() => {
                      if (documentUrl && document.files[currentPage - 1]) {
                        const a = window.document.createElement('a');
                        a.href = documentUrl;
                        a.download = document.files[currentPage - 1].name;
                        window.document.body.appendChild(a);
                        a.click();
                        window.document.body.removeChild(a);
                      }
                    }}
                    title="Download document"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Document Content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                <div 
                  className="bg-white border border-neutral-300 shadow-sm rounded"
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'center',
                    transition: 'transform 0.2s'
                  }}
                >
                  {isLoading ? (
                    <div className="w-[595px] h-[842px] p-8 relative flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                  ) : error ? (
                    <div className="w-[595px] h-[842px] p-8 relative flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-error-600 mb-2">{error}</p>
                        <button 
                          onClick={() => window.location.reload()}
                          className="btn btn-outline"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : document && document.files.length > 0 ? (
                    <div className="w-[595px] h-[842px] p-8 relative">
                      {documentUrl && (
                        <>
                          {document.files[currentPage - 1].type === 'application/pdf' ? (
                            fileContent ? (
                              <div className="w-full h-full">
                                {pdfLoadError ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center p-4">
                                      <p className="text-error-600 mb-4">Failed to load PDF document. Please try downloading instead.</p>
                                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <a
                                          href={documentUrl}
                                          download={document.files[currentPage - 1].name}
                                          className="btn btn-primary"
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download PDF
                                        </a>
                                        <a
                                          href={documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-outline"
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Open in New Tab
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Try iframe first */}
                                    <iframe
                                      src={fileContent}
                                      className="w-full h-full"
                                      title="PDF Document"
                                      onError={() => {
                                        console.error('PDF iframe failed to load');
                                        setPdfLoadError(true);
                                      }}
                                    >
                                      <p>Unable to display PDF file. <a href={documentUrl} download>Download</a> instead.</p>
                                    </iframe>
                                    
                                    {/* Fallback object tag */}
                                    <object
                                      data={fileContent}
                                      type="application/pdf"
                                      className="w-full h-full hidden"
                                      onError={() => {
                                        console.error('PDF object failed to load');
                                        // Only set error if iframe also failed
                                        if (pdfLoadError) {
                                          setPdfLoadError(true);
                                        }
                                      }}
                                    >
                                      <p>Unable to display PDF file. <a href={documentUrl} download>Download</a> instead.</p>
                                    </object>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                              </div>
                            )
                          ) : document.files[currentPage - 1].type.startsWith('image/') ? (
                            <img
                              src={documentUrl}
                              alt={`Page ${currentPage}`}
                              className="w-full h-full object-contain"
                            />
                          ) : document.files[currentPage - 1].type.includes('word') || 
                               document.files[currentPage - 1].type.includes('document') ||
                               document.files[currentPage - 1].name.endsWith('.docx') ||
                               document.files[currentPage - 1].name.endsWith('.doc') ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-neutral-600 mb-4">
                                  Word documents can be previewed after downloading
                                </p>
                                <a
                                  href={documentUrl}
                                  download={document.files[currentPage - 1].name}
                                  className="btn btn-primary"
                                >
                                  Download Document
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-neutral-600 mb-4">
                                  Preview not available for this file type
                                </p>
                                <p className="text-sm text-neutral-500 mb-4">
                                  File type: {document.files[currentPage - 1].type || 'unknown'}
                                </p>
                                <a
                                  href={documentUrl}
                                  download={document.files[currentPage - 1].name}
                                  className="btn btn-primary"
                                >
                                  Download File
                                </a>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-[595px] h-[842px] p-8 relative">
                      <h1 className="text-2xl font-bold mb-4">{document?.title}</h1>
                      <p className="mb-3">No document content available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Signature Panel */}
          <div className="md:w-1/3 bg-white p-6 overflow-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                Sign Document
              </h2>
              <p className="text-neutral-600">
                {document.title}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100 flex items-start mb-4">
                <div className="p-1 rounded-full bg-primary-100 mr-3 mt-1">
                  <HelpCircle className="h-4 w-4 text-primary-700" />
                </div>
                <div>
                  <p className="text-sm text-primary-800">
                    Your signature will be legally binding under the Indian IT Act, 2000. Choose your preferred method to sign this document.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Signature Methods */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Signature Method</h3>
              
              <div className="space-y-3">
                <div
                  className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                    signMethod === 'draw' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSignMethod('draw')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    signMethod === 'draw' ? 'border-primary-500' : 'border-neutral-300'
                  }`}>
                    {signMethod === 'draw' && (
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    )}
                  </div>
                  <span className="ml-3 text-neutral-800">Draw your signature</span>
                </div>
                
                <div
                  className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                    signMethod === 'type' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSignMethod('type')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    signMethod === 'type' ? 'border-primary-500' : 'border-neutral-300'
                  }`}>
                    {signMethod === 'type' && (
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    )}
                  </div>
                  <span className="ml-3 text-neutral-800">Type your name</span>
                </div>
                
                <div
                  className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                    signMethod === 'aadhaar' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSignMethod('aadhaar')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    signMethod === 'aadhaar' ? 'border-primary-500' : 'border-neutral-300'
                  }`}>
                    {signMethod === 'aadhaar' && (
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    )}
                  </div>
                  <span className="ml-3 text-neutral-800">Aadhaar eSign</span>
                  <span className="ml-auto bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-xs">Recommended</span>
                </div>
                
                <div
                  className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                    signMethod === 'dsc' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSignMethod('dsc')}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    signMethod === 'dsc' ? 'border-primary-500' : 'border-neutral-300'
                  }`}>
                    {signMethod === 'dsc' && (
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    )}
                  </div>
                  <span className="ml-3 text-neutral-800">Digital Signature Certificate (DSC)</span>
                </div>
              </div>
            </div>
            
            {/* Signature Area based on selected method */}
            <div className="mb-8">
              {signMethod === 'draw' && (
                <div>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg bg-white p-2 mb-3">
                    <PassiveSignaturePad
                      ref={sigPadRef}
                      canvasProps={{
                        className: 'signature-canvas w-full h-36',
                      }}
                      onEnd={handleSignatureEnd}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={clearSignature}
                      className="text-sm text-primary-700 hover:text-primary-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              
              {signMethod === 'type' && (
                <div>
                  <div className="mb-4">
                    <label htmlFor="typedName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Type your full name
                    </label>
                    <input
                      type="text"
                      id="typedName"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="input"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Select a style
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-colors text-center ${
                          typedStyle === 'style1' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setTypedStyle('style1')}
                      >
                        <span className="font-cursive text-lg">{typedName || 'Signature'}</span>
                        <span className="text-xs mt-1">Style 1</span>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-colors text-center ${
                          typedStyle === 'style2' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setTypedStyle('style2')}
                      >
                        <span className="font-serif italic text-lg">{typedName || 'Signature'}</span>
                        <span className="text-xs mt-1">Style 2</span>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-colors text-center ${
                          typedStyle === 'style3' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setTypedStyle('style3')}
                      >
                        <span className="font-mono text-lg">{typedName || 'Signature'}</span>
                        <span className="text-xs mt-1">Style 3</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {signMethod === 'aadhaar' && (
                <div className="text-center py-4">
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-4">
                    <p className="text-sm text-primary-800 mb-2">
                      Enter your Aadhaar number to receive an OTP on your Aadhaar-linked mobile number.
                    </p>
                    <div className="flex items-center justify-center text-xs text-primary-700">
                      <Shield className="h-4 w-4 mr-1" />
                      <span>Compliant with IT Act 2000</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      className="input w-full"
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength={12}
                    />
                    {error && <p className="text-error-600 text-sm mt-1">{error}</p>}
                  </div>
                  
                  <button 
                    onClick={handleRequestOTP}
                    className="btn btn-primary"
                    disabled={aadhaarNumber.length !== 12}
                  >
                    Request OTP
                  </button>
                </div>
              )}
              
              {signMethod === 'dsc' && (
                <div className="text-center py-4">
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 mb-4">
                    <p className="text-sm text-primary-800 mb-2">
                      Please ensure your DSC token is connected to your device and drivers are installed.
                    </p>
                    <p className="text-xs text-primary-700">
                      You'll be prompted to select your certificate in the next step.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleCompleteSignature}
                    className="btn btn-primary"
                  >
                    Continue with DSC
                  </button>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Link to="/dashboard" className="btn btn-outline">
                Cancel
              </Link>
              
              {(signMethod === 'draw' || signMethod === 'type') && (
                <button 
                  onClick={handleCompleteSignature}
                  className="btn btn-primary"
                  disabled={
                    (signMethod === 'draw' && !hasDrawnSignature) || 
                    (signMethod === 'type' && !typedName)
                  }
                >
                  Complete Signature
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Enter OTP</h3>
            <p className="text-neutral-600 mb-4">
              We've sent a one-time password to your Aadhaar-linked mobile number. Please enter it below.
            </p>
            
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setShowOTPModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerifyOTP}
                className="btn btn-primary"
                disabled={otp.length !== 6}
              >
                Verify & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSign;