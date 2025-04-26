import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock4
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const History: React.FC = () => {
  const { documents } = useDocuments();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'pending' | 'expired'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'signed' ? doc.status === 'signed' :
      statusFilter === 'pending' ? doc.status === 'pending' :
      statusFilter === 'expired' ? doc.status === 'expired' : true;

    const docDate = new Date(doc.uploadedAt);
    const today = new Date();
    const matchesDate = dateFilter === 'all' ? true :
      dateFilter === 'today' ? docDate.toDateString() === today.toDateString() :
      dateFilter === 'week' ? (today.getTime() - docDate.getTime()) <= 7 * 24 * 60 * 60 * 1000 :
      dateFilter === 'month' ? (today.getTime() - docDate.getTime()) <= 30 * 24 * 60 * 60 * 1000 : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort documents by date (most recent first)
  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <Clock4 className="h-5 w-5 text-warning-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-error-500" />;
      default:
        return <Clock className="h-5 w-5 text-neutral-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Document History</h1>
          <p className="text-neutral-600">View and track your document signing history</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="select"
              >
                <option value="all">All Status</option>
                <option value="signed">Signed</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {sortedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No documents found</h3>
              <p className="text-neutral-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/upload" className="btn btn-primary">
                Upload New Document
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-neutral-50 rounded-lg">
                        {getStatusIcon(doc.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{doc.title}</h3>
                        <p className="text-sm text-neutral-600">{doc.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`badge ${
                            doc.status === 'pending' ? 'badge-yellow' :
                            doc.status === 'signed' ? 'badge-green' :
                            'badge-red'
                          }`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                          <div className="flex items-center text-sm text-neutral-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* <div className="flex items-center gap-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-neutral-400 hover:text-primary-600 transition-colors"
                        title="View Document"
                      >
                        <Eye className="h-5 w-5" />
                      </Link> */}
                      
                      {/* <button
                        onClick={() => {
                          if (doc.files && doc.files.length > 0) {
                            const file = doc.files[0];
                            const url = URL.createObjectURL(file);
                            const link = window.document.createElement('a');
                            link.href = url;
                            link.download = file.name || doc.title;
                            window.document.body.appendChild(link);
                            link.click();
                            window.document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          }
                        }}
                        className="text-neutral-400 hover:text-primary-600 transition-colors"
                        title="Download Document"
                      >
                        <Download className="h-5 w-5" />
                      </button> */}
                    {/* </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 