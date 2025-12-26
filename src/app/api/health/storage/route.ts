import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if storage bucket is configured
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
    
    if (!bucketName) {
      return NextResponse.json({
        healthy: false,
        details: 'Storage bucket not configured (NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET missing)',
      });
    }

    // Try to list buckets to verify storage access
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json({
        healthy: false,
        details: `Storage access error: ${error.message}`,
      });
    }

    const bucketExists = buckets?.some((b) => b.name === bucketName);

    return NextResponse.json({
      healthy: bucketExists,
      details: bucketExists
        ? `Storage bucket "${bucketName}" is accessible`
        : `Storage bucket "${bucketName}" not found. Available buckets: ${buckets?.map((b) => b.name).join(', ') || 'none'}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      healthy: false,
      details: `Storage check failed: ${error.message || 'Unknown error'}`,
    });
  }
}

