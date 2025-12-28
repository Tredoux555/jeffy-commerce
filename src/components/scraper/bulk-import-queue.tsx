'use client';

import { useState } from 'react';
import { 
  Upload, Loader2, Check, X, AlertCircle, Trash2, 
  Play, Pause, RefreshCw, Download, FileText
} from 'lucide-react';
import {
  extractMultiple1688Urls,
  mockScrapeWithDelay,
  processProduct,
  formatZAR,
  formatCNY,
  DEFAULT_PRICING_CONFIG,
} from '@/lib/scraper';
import type { ImportJob, JeffyProductImport } from '@/lib/scraper';

export function BulkImportQueue() {
  const [inputText, setInputText] = useState('');
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const handleExtractUrls = () => {
    const extracted = extractMultiple1688Urls(inputText);
    const newJobs: ImportJob[] = extracted.map(item => ({
      id: `job_${Date.now()}_${item.productId}`,
      status: item.isValid ? 'pending' : 'failed',
      url: item.url,
      error: item.isValid ? undefined : 'Invalid URL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setJobs(prev => [...prev, ...newJobs]);
    setInputText('');
  };

  const processQueue = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    
    for (let i = 0; i < pendingJobs.length; i++) {
      const job = pendingJobs[i];
      
      // Update to scraping
      setJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'scraping' as const, updatedAt: new Date().toISOString() } : j
      ));
      
      try {
        // Scrape (mock)
        const productId = job.url.match(/\/offer\/(\d+)/)?.[1] || job.url;
        const raw = await mockScrapeWithDelay(productId, 1500);
        
        // Update to translating
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'translating' as const, rawData: raw, updatedAt: new Date().toISOString() } : j
        ));
        
        await new Promise(r => setTimeout(r, 500)); // Simulate translation
        
        // Update to processing
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'processing' as const, updatedAt: new Date().toISOString() } : j
        ));
        
        const processed = processProduct(raw, DEFAULT_PRICING_CONFIG);
        
        // Update to ready
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'ready' as const, processedData: processed, updatedAt: new Date().toISOString() } : j
        ));
        
        setProcessedCount(i + 1);
      } catch (error) {
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'failed' as const, error: 'Scraping failed', updatedAt: new Date().toISOString() } : j
        ));
      }
    }
    
    setIsProcessing(false);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const clearCompleted = () => {
    setJobs(prev => prev.filter(j => j.status !== 'ready' && j.status !== 'imported'));
  };

  const exportReady = () => {
    const readyProducts = jobs
      .filter(j => j.status === 'ready' && j.processedData)
      .map(j => j.processedData);
    
    const blob = new Blob([JSON.stringify(readyProducts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeffy-import-${Date.now()}.json`;
    a.click();
  };

  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const readyCount = jobs.filter(j => j.status === 'ready').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#ff6b35]" />
          Bulk Import Queue
        </h2>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste multiple 1688 URLs or product IDs (one per line, or comma-separated)..."
          rows={4}
          className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
        
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Paste URLs from 1688.com - supports multiple formats
          </p>
          <button
            onClick={handleExtractUrls}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            Add to Queue
          </button>
        </div>
      </div>

      {/* Queue Stats & Controls */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6 text-sm">
              <div><span className="font-bold text-gray-900">{jobs.length}</span> <span className="text-gray-500">Total</span></div>
              <div><span className="font-bold text-amber-600">{pendingCount}</span> <span className="text-gray-500">Pending</span></div>
              <div><span className="font-bold text-green-600">{readyCount}</span> <span className="text-gray-500">Ready</span></div>
              <div><span className="font-bold text-red-600">{failedCount}</span> <span className="text-gray-500">Failed</span></div>
            </div>
            
            <div className="flex gap-2">
              {readyCount > 0 && (
                <>
                  <button onClick={exportReady} className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                    <Download className="h-4 w-4" /> Export JSON
                  </button>
                  <button onClick={clearCompleted} className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                    <Trash2 className="h-4 w-4" /> Clear Done
                  </button>
                </>
              )}
              <button
                onClick={processQueue}
                disabled={isProcessing || pendingCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing {processedCount}/{pendingCount}</>
                ) : (
                  <><Play className="h-4 w-4" /> Process All</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job List */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {job.processedData ? (
                      <div>
                        <p className="font-medium">{job.processedData.name.slice(0, 40)}...</p>
                        <p className="text-sm text-gray-500">SKU: {job.processedData.sku}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-mono text-sm text-gray-600">{job.url.slice(0, 50)}...</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} error={job.error} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {job.processedData ? (
                      <div>
                        <p className="font-bold text-[#ff6b35]">{formatZAR(job.processedData.sellingPrice)}</p>
                        <p className="text-sm text-gray-500">Cost: {formatZAR(job.processedData.costPrice)}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-500">No products in queue</h3>
          <p className="text-sm text-gray-400 mt-1">Paste 1688 URLs above to start importing</p>
        </div>
      )}
    </div>
  );
}

function JobStatusBadge({ status, error }: { status: ImportJob['status']; error?: string }) {
  const configs = {
    pending: { icon: null, bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
    scraping: { icon: Loader2, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Scraping...' },
    translating: { icon: Loader2, bg: 'bg-purple-100', text: 'text-purple-600', label: 'Translating...' },
    processing: { icon: Loader2, bg: 'bg-amber-100', text: 'text-amber-600', label: 'Processing...' },
    ready: { icon: Check, bg: 'bg-green-100', text: 'text-green-600', label: 'Ready' },
    imported: { icon: Check, bg: 'bg-green-100', text: 'text-green-600', label: 'Imported' },
    failed: { icon: X, bg: 'bg-red-100', text: 'text-red-600', label: error || 'Failed' },
  };
  
  const config = configs[status];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {Icon && <Icon className={`h-3 w-3 ${status.includes('ing') ? 'animate-spin' : ''}`} />}
      {config.label}
    </span>
  );
}
