import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Document metadata
const DOCUMENTS = [
  {
    name: 'Zone Partner Agreement v4.1',
    slug: 'zone-partner-agreement-v4-1',
    description: 'Main contract for Zone Partners - CPA Section 7(2) compliant',
    category: 'agreement',
    version: '4.1',
    file_name: 'JEFFY_ZONE_PARTNER_AGREEMENT_v4.1.pdf',
    tags: ['contract', 'partner', 'CPA', 'legal']
  },
  {
    name: 'Franchise Disclosure Document',
    slug: 'franchise-disclosure-document',
    description: 'CPA Section 7 required disclosure - must be sent 14 days before agreement',
    category: 'disclosure',
    version: '1.0',
    file_name: 'JEFFY_DISCLOSURE_DOCUMENT.pdf',
    tags: ['CPA', 'franchise', 'disclosure', 'legal']
  },
  {
    name: 'Founding Partner Addendum',
    slug: 'founding-partner-addendum',
    description: 'Profit participation rights for first 30 Founding Partners',
    category: 'addendum',
    version: '1.0',
    file_name: 'JEFFY_FOUNDING_PARTNER_ADDENDUM.pdf',
    tags: ['founding', 'profit-share', 'addendum']
  },
  {
    name: 'Jeffy One-Pager',
    slug: 'jeffy-one-pager',
    description: 'Executive summary - the business in 1 page',
    category: 'internal',
    version: '1.0',
    file_name: 'JEFFY_ONE_PAGER.pdf',
    tags: ['investor', 'pitch', 'summary']
  },
  {
    name: 'Jeffy Business Plan',
    slug: 'jeffy-business-plan',
    description: 'Full 19-page investor-grade business plan',
    category: 'internal',
    version: '1.0',
    file_name: 'JEFFY_BUSINESS_PLAN.pdf',
    tags: ['investor', 'strategy', 'financials']
  }
];

export async function POST(request: Request) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: Array<{ name: string; status: string; error?: string }> = [];

    // First, ensure the storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'documents');
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        return NextResponse.json({ 
          error: 'Failed to create storage bucket', 
          details: bucketError.message 
        }, { status: 500 });
      }
    }

    // Get the form data with the files
    const formData = await request.formData();
    
    for (const doc of DOCUMENTS) {
      try {
        // Check if document already exists
        const { data: existing } = await supabase
          .from('legal_documents')
          .select('id')
          .eq('slug', doc.slug)
          .single();

        if (existing) {
          results.push({ name: doc.name, status: 'skipped - already exists' });
          continue;
        }

        // Get the file from form data
        const file = formData.get(doc.file_name) as File | null;
        
        if (!file) {
          results.push({ name: doc.name, status: 'skipped - no file provided' });
          continue;
        }

        // Upload to storage
        const filePath = `legal-documents/${doc.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          results.push({ name: doc.name, status: 'error', error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Insert into database
        const { error: dbError } = await supabase
          .from('legal_documents')
          .insert({
            name: doc.name,
            slug: doc.slug,
            description: doc.description,
            category: doc.category,
            version: doc.version,
            file_url: urlData.publicUrl,
            file_name: doc.file_name,
            file_size_bytes: file.size,
            is_active: true,
            is_current_version: true,
            tags: doc.tags
          });

        if (dbError) {
          results.push({ name: doc.name, status: 'error', error: dbError.message });
          continue;
        }

        results.push({ name: doc.name, status: 'success' });
      } catch (err) {
        results.push({ 
          name: doc.name, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({ 
      message: 'Document seeding complete',
      results 
    });

  } catch (error) {
    console.error('Seed documents error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('name, category, version, is_active')
      .order('category');

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch documents',
        details: error.message,
        hint: 'Have you run the database migrations?'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Legal documents status',
      count: data?.length || 0,
      documents: data,
      expected: DOCUMENTS.map(d => d.name)
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
