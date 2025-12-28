'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, CheckCircle, XCircle, Loader2, FileText, AlertTriangle } from 'lucide-react';

const EXPECTED_DOCUMENTS = [
  {
    file_name: 'JEFFY_ZONE_PARTNER_AGREEMENT_v4.1.pdf',
    name: 'Zone Partner Agreement v4.1',
    slug: 'zone-partner-agreement-v4-1',
    description: 'Main contract for Zone Partners - CPA Section 7(2) compliant',
    category: 'agreement',
    version: '4.1',
    tags: ['contract', 'partner', 'CPA', 'legal']
  },
  {
    file_name: 'JEFFY_DISCLOSURE_DOCUMENT.pdf',
    name: 'Franchise Disclosure Document',
    slug: 'franchise-disclosure-document',
    description: 'CPA Section 7 required disclosure - must be sent 14 days before agreement',
    category: 'disclosure',
    version: '1.0',
    tags: ['CPA', 'franchise', 'disclosure', 'legal']
  },
  {
    file_name: 'JEFFY_FOUNDING_PARTNER_ADDENDUM.pdf',
    name: 'Founding Partner Addendum',
    slug: 'founding-partner-addendum',
    description: 'Profit participation rights for first 30 Founding Partners',
    category: 'addendum',
    version: '1.0',
    tags: ['founding', 'profit-share', 'addendum']
  },
  {
    file_name: 'JEFFY_ONE_PAGER.pdf',
    name: 'Jeffy One-Pager',
    slug: 'jeffy-one-pager',
    description: 'Executive summary - the business in 1 page',
    category: 'internal',
    version: '1.0',
    tags: ['investor', 'pitch', 'summary']
  },
  {
    file_name: 'JEFFY_BUSINESS_PLAN.pdf',
    name: 'Jeffy Business Plan',
    slug: 'jeffy-business-plan',
    description: 'Full 19-page investor-grade business plan',
    category: 'internal',
    version: '1.0',
    tags: ['investor', 'strategy', 'financials']
  }
];

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'exists';

interface DocStatus {
  name: string;
  status: UploadStatus;
  error?: string;
  file?: File;
}

export default function SeedDocsPage() {
  const [docStatuses, setDocStatuses] = useState<DocStatus[]>(
    EXPECTED_DOCUMENTS.map(d => ({ name: d.name, status: 'pending' as UploadStatus }))
  );
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleFilesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    processFiles(droppedFiles);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    
    // Match files to expected documents
    setDocStatuses(prev => prev.map(doc => {
      const expectedDoc = EXPECTED_DOCUMENTS.find(d => d.name === doc.name);
      const matchedFile = newFiles.find(f => 
        f.name === expectedDoc?.file_name || 
        f.name.toLowerCase().includes(expectedDoc?.slug.replace(/-/g, '') || '')
      );
      
      if (matchedFile) {
        return { ...doc, file: matchedFile, status: 'pending' as UploadStatus };
      }
      return doc;
    }));
  };

  const uploadAllDocuments = async () => {
    setUploading(true);
    setMigrationError(null);

    // First check if table exists
    const { error: tableError } = await supabase
      .from('legal_documents')
      .select('id')
      .limit(1);

    if (tableError?.message.includes('does not exist')) {
      setMigrationError('The legal_documents table does not exist. Please run the database migrations first.');
      setUploading(false);
      return;
    }

    for (let i = 0; i < EXPECTED_DOCUMENTS.length; i++) {
      const expectedDoc = EXPECTED_DOCUMENTS[i];
      const docStatus = docStatuses[i];

      // Update status to uploading
      setDocStatuses(prev => prev.map((d, idx) => 
        idx === i ? { ...d, status: 'uploading' as UploadStatus } : d
      ));

      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('legal_documents')
          .select('id')
          .eq('slug', expectedDoc.slug)
          .single();

        if (existing) {
          setDocStatuses(prev => prev.map((d, idx) => 
            idx === i ? { ...d, status: 'exists' as UploadStatus } : d
          ));
          continue;
        }

        // Find matching file
        const file = files.find(f => 
          f.name === expectedDoc.file_name ||
          f.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(
            expectedDoc.name.toLowerCase().replace(/[^a-z0-9]/g, '')
          )
        );

        if (!file) {
          setDocStatuses(prev => prev.map((d, idx) => 
            idx === i ? { ...d, status: 'error' as UploadStatus, error: 'No matching file found' } : d
          ));
          continue;
        }

        // Upload to storage
        const filePath = `legal-documents/${expectedDoc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Insert into database
        const { error: dbError } = await supabase
          .from('legal_documents')
          .insert({
            name: expectedDoc.name,
            slug: expectedDoc.slug,
            description: expectedDoc.description,
            category: expectedDoc.category,
            version: expectedDoc.version,
            file_url: urlData.publicUrl,
            file_name: expectedDoc.file_name,
            file_size_bytes: file.size,
            is_active: true,
            is_current_version: true,
            tags: expectedDoc.tags
          });

        if (dbError) {
          throw new Error(dbError.message);
        }

        setDocStatuses(prev => prev.map((d, idx) => 
          idx === i ? { ...d, status: 'success' as UploadStatus } : d
        ));

      } catch (err) {
        setDocStatuses(prev => prev.map((d, idx) => 
          idx === i ? { 
            ...d, 
            status: 'error' as UploadStatus, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          } : d
        ));
      }
    }

    setUploading(false);
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'success':
      case 'exists':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const matchedCount = files.filter(f => 
    EXPECTED_DOCUMENTS.some(d => 
      f.name === d.file_name || 
      f.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(
        d.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      )
    )
  ).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">📄 Seed Legal Documents</h1>
      <p className="text-gray-600 mb-6">
        Upload all 5 legal documents at once. Drop the PDF files below.
      </p>

      {migrationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Database Migration Required</h3>
              <p className="text-red-700 text-sm mt-1">{migrationError}</p>
              <p className="text-red-600 text-sm mt-2">
                Go to Supabase → SQL Editor → Paste the JEFFY_MIGRATIONS.sql content → Run
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDrop={handleFilesDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors mb-6"
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag & drop your PDF files here</p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <label className="px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors">
          Select Files
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFilesSelect}
            className="hidden"
          />
        </label>
        {files.length > 0 && (
          <p className="mt-4 text-sm text-green-600">
            ✓ {files.length} file(s) selected, {matchedCount} matched
          </p>
        )}
      </div>

      {/* Expected Documents List */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h2 className="font-semibold mb-4">Expected Documents:</h2>
        <div className="space-y-3">
          {EXPECTED_DOCUMENTS.map((doc, idx) => {
            const status = docStatuses[idx];
            const hasFile = files.some(f => 
              f.name === doc.file_name ||
              f.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(
                doc.name.toLowerCase().replace(/[^a-z0-9]/g, '')
              )
            );
            
            return (
              <div key={doc.slug} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.file_name}</p>
                  {status.error && (
                    <p className="text-xs text-red-500 mt-1">{status.error}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  hasFile ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {status.status === 'exists' ? 'Already exists' : 
                   status.status === 'success' ? 'Uploaded' :
                   hasFile ? 'Ready' : 'Waiting'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={uploadAllDocuments}
        disabled={uploading || matchedCount === 0}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload All Documents ({matchedCount}/5 ready)
          </>
        )}
      </button>

      {/* Success Message */}
      {docStatuses.every(d => d.status === 'success' || d.status === 'exists') && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">All documents uploaded!</p>
          <a 
            href="/admin/documentation" 
            className="text-green-600 hover:underline text-sm"
          >
            View Documentation Center →
          </a>
        </div>
      )}
    </div>
  );
}
