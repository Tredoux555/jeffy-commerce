import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Direct test endpoint - DELETE AFTER TESTING
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('email');
  
  if (!testEmail) {
    return NextResponse.json({ 
      error: 'Add ?email=your@email.com to test',
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPreview: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'Jeffy <hello@jeffy.co.za>',
      to: testEmail,
      subject: 'Jeffy Email Test ✅',
      html: '<h1>Email is working!</h1><p>If you see this, Resend is properly configured.</p>'
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id, sentTo: testEmail });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
