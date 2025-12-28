import { NextRequest, NextResponse } from 'next/server';
import { 
  runCompleteTestSuite, 
  runSchemaTests, 
  runLegalTests,
  runPricingTests 
} from '@/lib/testing/e2e-complete-test-suite';

export const maxDuration = 60; // Allow 60 seconds for full test

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'full' } = body;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    switch (type) {
      case 'schema':
        const schemaResults = await runSchemaTests();
        return NextResponse.json({
          success: true,
          type: 'schema',
          results: schemaResults,
          summary: {
            total: schemaResults.length,
            passed: schemaResults.filter(s => s.status === 'passed').length,
            failed: schemaResults.filter(s => s.status === 'failed').length
          }
        });

      case 'legal':
        const legalResults = await runLegalTests();
        return NextResponse.json({
          success: true,
          type: 'legal',
          results: legalResults,
          summary: {
            total: legalResults.length,
            passed: legalResults.filter(s => s.status === 'passed').length,
            failed: legalResults.filter(s => s.status === 'failed').length
          }
        });

      case 'pricing':
        const pricingResults = await runPricingTests();
        return NextResponse.json({
          success: true,
          type: 'pricing',
          results: pricingResults,
          summary: {
            total: pricingResults.length,
            passed: pricingResults.filter(s => s.status === 'passed').length,
            failed: pricingResults.filter(s => s.status === 'failed').length
          }
        });

      case 'full':
      default:
        const fullResults = await runCompleteTestSuite(baseUrl);
        return NextResponse.json({
          success: true,
          type: 'full',
          results: fullResults
        });
    }
  } catch (error: any) {
    console.error('E2E test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    available: [
      {
        type: 'schema',
        description: 'Test all database tables exist (13 tables)',
        estimated: '2s'
      },
      {
        type: 'legal',
        description: 'Test legal compliance calculations (14-day, cooling-off)',
        estimated: '1s'
      },
      {
        type: 'pricing',
        description: 'Test pricing calculations (CNY to ZAR, margins)',
        estimated: '1s'
      },
      {
        type: 'full',
        description: 'Complete E2E test covering all 34 operations',
        estimated: '30-45s'
      }
    ],
    usage: 'POST { "type": "full" | "schema" | "legal" | "pricing" }'
  });
}
