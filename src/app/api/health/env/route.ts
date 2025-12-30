import { NextResponse } from 'next/server';

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

export async function GET() {
  const missing: string[] = [];
  const present: string[] = [];

  requiredEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  const healthy = missing.length === 0;

  return NextResponse.json({
    healthy,
    details: healthy
      ? `All ${present.length} required environment variables are present`
      : `Missing: ${missing.join(', ')}`,
    present,
    missing,
  });
}




