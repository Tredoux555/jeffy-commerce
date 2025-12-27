import { NextRequest, NextResponse } from 'next/server';
import { adminLogin, adminLogout, isAdminLoggedIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password, action } = await request.json();

    if (action === 'logout') {
      await adminLogout();
      return NextResponse.json({ success: true });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const success = await adminLogin(password);
    
    if (!success) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function GET() {
  const loggedIn = await isAdminLoggedIn();
  return NextResponse.json({ loggedIn });
}
