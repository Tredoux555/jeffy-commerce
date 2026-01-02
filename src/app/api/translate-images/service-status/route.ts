/**
 * API Route: Translation Service Status
 * GET /api/translate-images/service-status
 * 
 * Returns the availability status of translation services.
 * Useful for showing users what methods are available.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTranslationServiceStatus } from '@/lib/image-translator';

export async function GET(request: NextRequest) {
  try {
    const status = getTranslationServiceStatus();

    return NextResponse.json({
      ...status,
      // Add human-readable descriptions
      description: status.recommended === 'alibaba' 
        ? 'Using Alibaba Qwen-MT-Image (optimal for 1688 products)'
        : status.recommended === 'claude'
          ? 'Using Claude Vision fallback (good quality, slightly slower)'
          : 'No translation service configured',
      
      // Pricing info
      pricing: {
        alibaba: status.services.alibaba 
          ? { perImage: '$0.0004', per1000: '$0.40' }
          : null,
        claude: status.services.claude
          ? { perImage: '~$0.003', per1000: '~$3.00' }
          : null,
      },

      // Configuration hints
      configurationNeeded: !status.available
        ? ['Set ALIBABA_DASHSCOPE_API_KEY (recommended) or ANTHROPIC_API_KEY in environment variables']
        : [],
    });

  } catch (error) {
    console.error('Service status error:', error);
    return NextResponse.json(
      { error: 'Failed to check service status' },
      { status: 500 }
    );
  }
}

