import React, { useState, useEffect } from 'react';
import {  
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Users
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';

const Analytics: React.FC = () => {
  const { documents } = useDocuments();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate document statistics
  const totalDocuments = documents.length;
  const signedDocuments = documents.filter(doc => doc.status === 'signed').length;
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length;
  const expiredDocuments = documents.filter(doc => doc.status === 'expired').length;
  const completionRate = totalDocuments > 0 ? Math.round((signedDocuments / totalDocuments) * 100) : 0;

  // Generate chart data based on time range
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      const today = new Date();
      let data = [];
      
      if (timeRange === 'week') {
        // Generate data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          // Random data for demonstration
          const signed = Math.floor(Math.random() * 5);
          const pending = Math.floor(Math.random() * 3);
          const expired = Math.floor(Math.random() * 2);
          
          data.push({
            date: dateStr,
            signed,
            pending,
            expired,
            total: signed + pending + expired
          });
        }
      } else if (timeRange === 'month') {
        // Generate data for the last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Random data for demonstration
          const signed = Math.floor(Math.random() * 8);
          const pending = Math.floor(Math.random() * 5);
          const expired = Math.floor(Math.random() * 3);
          
          data.push({
            date: dateStr,
            signed,
            pending,
            expired,
            total: signed + pending + expired
          });
        }
      } else {
        // Generate data for the last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short' });
          
          // Random data for demonstration
          const signed = Math.floor(Math.random() * 20);
          const pending = Math.floor(Math.random() * 10);
          const expired = Math.floor(Math.random() * 5);
          
          data.push({
            date: dateStr,
            signed,
            pending,
            expired,
            total: signed + pending + expired
          });
        }
      }
      
      setChartData(data);
      setIsLoading(false);
    }, 500);
  }, [timeRange]);

  // Calculate average signing time (in hours)
  const calculateAverageSigningTime = () => {
    const signedDocs = documents.filter(doc => doc.status === 'signed');
    if (signedDocs.length === 0) return 0;
    
    let totalTime = 0;
    signedDocs.forEach(doc => {
      const uploadDate = new Date(doc.uploadedAt);
      const signDate = new Date(doc.signedAt || new Date());
      const diffHours = (signDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60);
      totalTime += diffHours;
    });
    
    return Math.round(totalTime / signedDocs.length);
  };

  // Calculate most active signers
  const getMostActiveSigners = () => {
    const signerCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      doc.signers.forEach(signer => {
        if (signer.signature) {
          signerCounts[signer.email] = (signerCounts[signer.email] || 0) + 1;
        }
      });
    });
    
    return Object.entries(signerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }));
  };

  const averageSigningTime = calculateAverageSigningTime();
  const mostActiveSigners = getMostActiveSigners();

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600">Track your document signing activity and performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-500">Total Documents</p>
              <p className="text-2xl font-semibold">{totalDocuments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-success-50 text-success-700">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-500">Signed Documents</p>
              <p className="text-2xl font-semibold">{signedDocuments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-warning-50 text-warning-700">
              <Clock className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-500">Pending Documents</p>
              <p className="text-2xl font-semibold">{pendingDocuments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-error-50 text-error-700">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-500">Expired Documents</p>
              <p className="text-2xl font-semibold">{expiredDocuments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Document Activity</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-1"></div>
                  <span className="text-xs text-neutral-500">Signed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-1"></div>
                  <span className="text-xs text-neutral-500">Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-error-500 mr-1"></div>
                  <span className="text-xs text-neutral-500">Expired</span>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="h-64">
                {/* Simple bar chart visualization */}
                <div className="h-full flex items-end justify-between">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-full">
                      <div className="flex items-end h-48 w-full">
                        <div 
                          className="w-full bg-success-500 rounded-t"
                          style={{ height: `${(item.signed / item.total) * 100}%` }}
                        ></div>
                        <div 
                          className="w-full bg-warning-500"
                          style={{ height: `${(item.pending / item.total) * 100}%` }}
                        ></div>
                        <div 
                          className="w-full bg-error-500 rounded-b"
                          style={{ height: `${(item.expired / item.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-2">{item.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Performance Metrics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-neutral-500">Completion Rate</p>
                    <p className="text-sm font-medium text-neutral-900">{completionRate}%</p>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-neutral-500">Average Signing Time</p>
                    <p className="text-sm font-medium text-neutral-900">{averageSigningTime} hours</p>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(averageSigningTime * 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Most Active Signers</h2>
              
              {mostActiveSigners.length === 0 ? (
                <p className="text-neutral-500 text-center py-4">No signing activity yet</p>
              ) : (
                <div className="space-y-3">
                  {mostActiveSigners.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-primary-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{signer.email}</p>
                          <p className="text-xs text-neutral-500">Signer</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-neutral-900">{signer.count} documents</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 