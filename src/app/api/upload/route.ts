import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if env vars exist
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing env vars:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseServiceKey 
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('Upload attempt:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });

    // Validate file type - include HEIC for iPhone
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    // Some mobile browsers report empty or generic type
    const isImage = allowedTypes.includes(file.type) || 
                    file.type.startsWith('image/') || 
                    file.type === '' || 
                    file.type === 'application/octet-stream';
    
    if (!isImage) {
      console.log('Rejected file type:', file.type);
      return NextResponse.json({ success: false, error: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `wants/${timestamp}-${randomStr}.${ext}`;

    // Convert file to Uint8Array (more compatible)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Determine content type (default to jpeg if unknown)
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = 'image/jpeg';
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, uint8Array, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Upload failed: ${error.message}` 
      }, { status: 500 });
    }

    console.log('Upload success:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: filename
    });

  } catch (error: any) {
    console.error('Upload catch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
