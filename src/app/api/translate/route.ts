import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Translation service not configured' }, { status: 500 });
    }

    let prompt = '';
    
    if (type === 'title') {
      prompt = `Translate this Chinese product title to English. Make it clear, professional, and suitable for an e-commerce store. Keep it concise (under 80 characters). Only return the translated title, nothing else.

Chinese title: ${text}`;
    } else if (type === 'description') {
      prompt = `Translate and improve this Chinese product description for an English e-commerce store. Make it:
- Clear and professional
- Highlight key features and benefits
- Use bullet points for specifications
- Remove any duplicate or garbled text
- Make it compelling for customers

Only return the improved English description, nothing else.

Chinese description: ${text}`;
    } else {
      prompt = `Translate this Chinese text to English. Make it clear and natural. Only return the translation.

Text: ${text}`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const translation = (message.content[0] as any).text;

    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
