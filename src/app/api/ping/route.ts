import { NextResponse } from 'next/server';

export async function GET() {
  console.log('PING API HIT');
  return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
}
