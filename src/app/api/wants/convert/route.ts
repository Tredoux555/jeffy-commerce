import { NextRequest, NextResponse } from 'next/server';
import { convertWantToProduct, getPendingConversions } from '@/lib/want-to-product';

export async function POST(request: NextRequest) {
  try {
    const { wantId } = await request.json();

    if (!wantId) {
      return NextResponse.json({ error: 'Want ID required' }, { status: 400 });
    }

    const result = await convertWantToProduct(wantId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      product: result.product,
      whatsappUrl: result.whatsappUrl,
      message: 'Want converted to product successfully',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const result = await getPendingConversions();
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    pendingWants: result.wants,
  });
}
