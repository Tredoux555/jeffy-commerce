import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'tredoux555@gmail.com';
  
  try {
    // Check if API key exists
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        hasKey: false 
      }, { status: 500 });
    }

    // Try to send test email
    const result = await resend.emails.send({
      from: 'Tredoux from Jeffy <hello@jeffy.co.za>',
      replyTo: 'tredoux@gmail.com',
      to: email,
      subject: 'Jeffy Email Test - ' + new Date().toISOString(),
      html: `
        <h1>Email Test Successful</h1>
        <p>If you see this, Resend is working!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      result,
      apiKeyPresent: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      errorDetails: error,
      apiKeyPresent: !!process.env.RESEND_API_KEY
    }, { status: 500 });
  }
}
