import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, productId } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No image URLs provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < Math.min(imageUrls.length, 10); i++) {
      const url = imageUrls[i];
      try {
        // Fetch image with proper headers to bypass hotlink protection
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://detail.1688.com/',
            'Accept': 'image/webp,image/*,*/*'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch image ${i}: ${response.status}`);
          continue;
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();
        
        // Determine file extension
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';
        else if (contentType.includes('gif')) ext = 'gif';

        const fileName = `${productId || 'product'}_${timestamp}_${i}.${ext}`;
        const filePath = `products/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, buffer, {
            contentType,
            upsert: true
          });

        if (error) {
          console.log(`Upload error for image ${i}:`, error.message);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (err) {
        console.log(`Error processing image ${i}:`, err);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedUrls.length,
      images: uploadedUrls,
      primaryImage: uploadedUrls[0] || null
    });

  } catch (error: any) {
    console.error('Image download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
