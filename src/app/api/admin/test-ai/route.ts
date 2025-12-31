import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'ANTHROPIC_API_KEY not set',
        keyPresent: false
      }, { status: 500 });
    }
    
    // Quick test with minimal tokens
    const client = new Anthropic({ apiKey });
    
    const startTime = Date.now();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "API working" and nothing else.' }]
    });
    const duration = Date.now() - startTime;
    
    const response = message.content[0];
    const text = response.type === 'text' ? response.text : '';
    
    return NextResponse.json({
      status: 'ok',
      message: 'Anthropic API is working',
      response: text,
      durationMs: duration,
      keyPresent: true,
      keyPrefix: apiKey.slice(0, 10) + '...'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      keyPresent: !!process.env.ANTHROPIC_API_KEY
    }, { status: 500 });
  }
}
