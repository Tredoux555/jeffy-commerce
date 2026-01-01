import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Debug endpoint to test email configuration
// Visit: /api/debug/email-test?email=your@email.com

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('email');
  
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    resendKeyPresent: !!process.env.RESEND_API_KEY,
    resendKeyPreview: process.env.RESEND_API_KEY 
      ? `${process.env.RESEND_API_KEY.substring(0, 8)}...${process.env.RESEND_API_KEY.slice(-4)}`
      : 'NOT SET',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
  };

  // If test email provided, try sending
  if (testEmail) {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        ...diagnostics,
        error: 'RESEND_API_KEY is not set in environment variables',
        testResult: 'FAILED'
      });
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: 'Jeffy <hello@jeffy.co.za>',
        to: testEmail,
        subject: '✅ Jeffy Email Test - It Works!',
        html: `
          <h1>Email Test Successful!</h1>
          <p>If you're seeing this, Jeffy's email system is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is a test email from jeffy.co.za</p>
        `,
      });

      if (error) {
        return NextResponse.json({
          ...diagnostics,
          testEmail,
          testResult: 'FAILED',
          error: error,
          errorMessage: error.message,
        });
      }

      return NextResponse.json({
        ...diagnostics,
        testEmail,
        testResult: 'SUCCESS',
        messageId: data?.id,
        message: 'Test email sent successfully! Check your inbox.'
      });

    } catch (err: any) {
      return NextResponse.json({
        ...diagnostics,
        testEmail,
        testResult: 'EXCEPTION',
        error: err.message,
        stack: err.stack?.split('\n').slice(0, 3)
      });
    }
  }

  return NextResponse.json({
    ...diagnostics,
    usage: 'Add ?email=your@email.com to send a test email',
    testResult: 'NOT_RUN'
  });
}
