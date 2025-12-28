'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Download, 
  Eye,
  Search,
  BookOpen,
  Scale,
  FileCheck,
  Briefcase,
  Settings,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  FolderOpen,
  Star
} from 'lucide-react';

// Document sections with their documents
const DOCUMENTATION_SECTIONS = [
  {
    id: 'business',
    title: '📊 Business Plans & Strategy',
    description: 'Core business documents for investors and stakeholders',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
    documents: [
      {
        name: 'Jeffy One-Pager',
        description: 'Executive summary - the business in 1 page',
        version: '1.0',
        category: 'internal',
        tags: ['investor', 'pitch', 'summary'],
        importance: 'high'
      },
      {
        name: 'Jeffy Business Plan',
        description: 'Full 19-page investor-grade business plan',
        version: '1.0',
        category: 'internal',
        tags: ['investor', 'strategy', 'financials'],
        importance: 'high'
      }
    ]
  },
  {
    id: 'legal-agreements',
    title: '📜 Legal Agreements',
    description: 'Contracts and agreements for Zone Partners',
    icon: Scale,
    color: 'from-purple-500 to-purple-600',
    documents: [
      {
        name: 'Zone Partner Agreement v4.1',
        description: 'Main contract for Zone Partners (CPA compliant)',
        version: '4.1',
        category: 'agreement',
        tags: ['contract', 'partner', 'CPA'],
        importance: 'critical',
        legalNote: 'Must be signed AFTER 14-day disclosure period'
      },
      {
        name: 'Founding Partner Addendum',
        description: 'Profit participation rights for first 30 partners',
        version: '1.0',
        category: 'addendum',
        tags: ['founding', 'equity', 'profit-share'],
        importance: 'high',
        legalNote: 'Only for Founding Partner tier'
      }
    ]
  },
  {
    id: 'compliance',
    title: '⚖️ Compliance & Disclosure',
    description: 'Documents required by law before signing',
    icon: Shield,
    color: 'from-green-500 to-green-600',
    documents: [
      {
        name: 'Franchise Disclosure Document',
        description: 'CPA Section 7 required disclosure',
        version: '1.0',
        category: 'disclosure',
        tags: ['CPA', 'franchise', 'legal'],
        importance: 'critical',
        legalNote: 'Must be sent 14 DAYS before agreement can be signed'
      }
    ]
  },
  {
    id: 'company',
    title: '🏢 Company Documents',
    description: 'Official company registration and certificates',
    icon: FileCheck,
    color: 'from-orange-500 to-orange-600',
    documents: [
      {
        name: 'CIPC Registration Certificate',
        description: 'Company registration COR14.3',
        version: 'N/A',
        category: 'certificate',
        tags: ['CIPC', 'registration', 'official'],
        importance: 'critical',
        externalNote: 'Registration: 2025/950712/07'
      }
    ]
  },
  {
    id: 'operations',
    title: '⚙️ Operations & Processes',
    description: 'Internal guides and procedures',
    icon: Settings,
    color: 'from-slate-500 to-slate-600',
    documents: [
      {
        name: 'Implementation Plan',
        description: 'Technical build roadmap and phases',
        version: '1.0',
        category: 'internal',
        tags: ['technical', 'roadmap', 'development'],
        importance: 'medium'
      },
      {
        name: 'Database Migrations',
        description: 'SQL schema for all new tables',
        version: '1.0',
        category: 'internal',
        tags: ['technical', 'database', 'SQL'],
        importance: 'high'
      }
    ]
  }
];

// Company info for quick reference
const COMPANY_INFO = {
  name: 'JEFFY COMMERCE (Pty) Ltd',
  registration: '2025/950712/07',
  taxNumber: '9168272293',
  registrationDate: '10 December 2025',
  director: 'Tredoux Willemse',
  address: 'Kendy Farm, Mullers Pass, Newcastle, KwaZulu-Natal, 2940',
  financialYearEnd: 'February'
};

interface StoredDocument {
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
  created_at: string;
}

export default function AdminDocumentationPage() {
  const [storedDocuments, setStoredDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchStoredDocuments();
  }, []);

  const fetchStoredDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStoredDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const findStoredDocument = (docName: string): StoredDocument | null => {
    const normalizedSearch = docName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return storedDocuments.find(sd => {
      const normalizedName = sd.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName);
    }) || null;
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">High Priority</span>;
      default:
        return null;
    }
  };

  const filteredSections = DOCUMENTATION_SECTIONS.filter(section => {
    if (selectedSection && section.id !== selectedSection) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        section.title.toLowerCase().includes(query) ||
        section.documents.some(doc => 
          doc.name.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query))
        )
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
              Documentation Center
            </h1>
            <p className="text-gray-500 mt-2">
              All business, legal, and operational documents in one place
            </p>
          </div>
          <a
            href="/legal"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Manage Documents
          </a>
        </div>

        {/* Company Quick Reference */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {COMPANY_INFO.name}
              </h2>
              <p className="text-slate-300 mt-1">Quick Reference</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                ✓ Active & Registered
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-slate-400 text-sm">Registration Number</p>
              <p className="font-mono font-medium">{COMPANY_INFO.registration}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tax Number</p>
              <p className="font-mono font-medium">{COMPANY_INFO.taxNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Registered</p>
              <p className="font-medium">{COMPANY_INFO.registrationDate}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Financial Year End</p>
              <p className="font-medium">{COMPANY_INFO.financialYearEnd}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, tags, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedSection || ''}
            onChange={(e) => setSelectedSection(e.target.value || null)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 min-w-[200px]"
          >
            <option value="">All Sections</option>
            {DOCUMENTATION_SECTIONS.map(section => (
              <option key={section.id} value={section.id}>{section.title.replace(/^[^\s]+\s/, '')}</option>
            ))}
          </select>
        </div>

        {/* Legal Compliance Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Legal Compliance Reminder</h3>
              <p className="text-amber-700 text-sm mt-1">
                <strong>14-Day Rule:</strong> The Disclosure Document must be sent to applicants at least 14 days before they can sign the Zone Partner Agreement. 
                <strong className="ml-2">10-Day Cooling Off:</strong> Partners can cancel within 10 business days of signing without penalty.
              </p>
            </div>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-8">
          {filteredSections.map(section => (
            <div key={section.id} className="bg-white rounded-2xl border overflow-hidden">
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.color} p-5`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                    <p className="text-white/80 text-sm">{section.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Documents */}
              <div className="p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {section.documents.map((doc, idx) => {
                    const storedDoc = findStoredDocument(doc.name);
                    const hasFile = !!storedDoc;

                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl p-4 transition-all ${
                          hasFile 
                            ? 'bg-white hover:shadow-md hover:border-orange-200' 
                            : 'bg-gray-50 border-dashed'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              hasFile ? 'bg-green-100' : 'bg-gray-200'
                            }`}>
                              {hasFile ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                            </div>
                          </div>
                          {getImportanceBadge(doc.importance)}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            v{doc.version}
                          </span>
                        </div>

                        {/* Legal Note */}
                        {doc.legalNote && (
                          <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {doc.legalNote}
                            </p>
                          </div>
                        )}

                        {/* External Note */}
                        {doc.externalNote && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700 font-mono">
                              {doc.externalNote}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          {hasFile ? (
                            <>
                              <a
                                href={storedDoc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </a>
                              <a
                                href={storedDoc.file_url}
                                download
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </>
                          ) : (
                            <a
                              href="/legal"
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Upload Document
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{storedDocuments.length}</p>
            <p className="text-sm text-gray-500">Documents Uploaded</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {DOCUMENTATION_SECTIONS.reduce((acc, s) => acc + s.documents.filter(d => findStoredDocument(d.name)).length, 0)}
            </p>
            <p className="text-sm text-gray-500">Documents Ready</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">
              {DOCUMENTATION_SECTIONS.reduce((acc, s) => acc + s.documents.filter(d => !findStoredDocument(d.name)).length, 0)}
            </p>
            <p className="text-sm text-gray-500">Pending Upload</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{DOCUMENTATION_SECTIONS.length}</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
