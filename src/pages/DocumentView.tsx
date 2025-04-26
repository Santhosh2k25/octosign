import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  FileText
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument } = useDocuments();
  const document = getDocument(id || '');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  
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
          const arrayBuffer = await currentFile.arrayBuffer();
          const base64String = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );
          const dataUrl = `data:application/pdf;base64,${base64String}`;
          setFileContent(dataUrl);
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
  }, [document, currentPage]);
  
  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);
  
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/documents" className="text-neutral-600 hover:text-neutral-900 mr-4">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">{document.title}</h1>
              <p className="text-neutral-600">View signed document</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
                    const file = document.files[currentPage - 1];
                    const a = window.document.createElement('a');
                    a.href = documentUrl;
                    a.download = file.name;
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
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 flex items-center justify-center">
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
                          <object
                            data={fileContent}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <p>Unable to display PDF file. <a href={documentUrl} download>Download</a> instead.</p>
                          </object>
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
    </div>
  );
};

export default DocumentView; 