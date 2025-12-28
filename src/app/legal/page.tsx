'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Search,
  FolderOpen,
  Shield,
  FileCheck,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';

interface LegalDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  file_url: string;
  file_name: string;
  file_size_bytes: number;
  is_active: boolean;
  is_current_version: boolean;
  effective_date: string;
  created_at: string;
  created_by: string;
  tags: string[];
  notes: string;
}

const CATEGORIES = [
  { id: 'agreement', name: 'Agreements', icon: FileCheck, color: 'bg-blue-500' },
  { id: 'disclosure', name: 'Disclosures', icon: Eye, color: 'bg-green-500' },
  { id: 'addendum', name: 'Addendums', icon: Plus, color: 'bg-purple-500' },
  { id: 'policy', name: 'Policies', icon: Shield, color: 'bg-orange-500' },
  { id: 'template', name: 'Templates', icon: FileText, color: 'bg-gray-500' },
  { id: 'certificate', name: 'Certificates', icon: CheckCircle, color: 'bg-yellow-500' },
  { id: 'internal', name: 'Internal', icon: FolderOpen, color: 'bg-red-500' },
  { id: 'other', name: 'Other', icon: FileText, color: 'bg-slate-500' },
];

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const version = formData.get('version') as string || '1.0';
    
    if (!file || !name || !category) {
      alert('Please fill in all required fields');
      setUploading(false);
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;
      const filePath = `legal-documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { error: dbError } = await supabase
        .from('legal_documents')
        .insert({
          name,
          slug: `${slug}-${Date.now()}`,
          description,
          category,
          version,
          file_url: publicUrl,
          file_name: file.name,
          file_size_bytes: file.size,
          is_active: true,
          is_current_version: true,
          effective_date: new Date().toISOString().split('T')[0],
          created_by: 'admin',
        });
      
      if (dbError) throw dbError;
      
      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: LegalDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('legal_documents')
        .delete()
        .eq('id', doc.id);
      
      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const groupedDocuments = CATEGORIES.map(cat => ({
    ...cat,
    documents: documents.filter(d => d.category === cat.id)
  })).filter(cat => cat.documents.length > 0 || selectedCategory === cat.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-7 h-7 text-orange-500" />
                Legal Documents
              </h1>
              <p className="text-gray-500 mt-1">
                Manage agreements, disclosures, and compliance documents
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
          
          <div className="flex gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.slice(0, 5).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">No documents found</h3>
            <p className="text-gray-500 mt-2">Upload your first document to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedDocuments.map(group => (
              <div key={group.id}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 ${group.color} rounded-lg flex items-center justify-center`}>
                    <group.icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
                  <span className="text-sm text-gray-500">({group.documents.length})</span>
                </div>
                
                {group.documents.length === 0 ? (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                    No documents in this category
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.documents.map(doc => {
                      const catInfo = getCategoryInfo(doc.category);
                      return (
                        <div
                          key={doc.id}
                          className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                            !doc.is_active ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${catInfo.color} rounded-lg flex items-center justify-center`}>
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                                <p className="text-sm text-gray-500">v{doc.version}</p>
                              </div>
                            </div>
                            {doc.is_current_version && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <span>{formatFileSize(doc.file_size_bytes)}</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={doc.file_url}
                              download={doc.file_name}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Zone Partner Agreement v4.1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  name="version"
                  placeholder="1.0"
                  defaultValue="1.0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of this document..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX files only</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
