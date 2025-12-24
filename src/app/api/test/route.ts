import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== Test GET API called ===');
  return NextResponse.json({
    success: true,
    message: 'Test GET API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('=== Test POST API called ===');
  return NextResponse.json({
    success: true,
    message: 'Test POST API is working',
    timestamp: new Date().toISOString()
  });
}
