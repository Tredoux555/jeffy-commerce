import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are an expert at finding products on Chinese wholesale platform 1688.com.

The user wants to find: "${searchTerm}"

Generate 3-5 Chinese search terms that would give the BEST results on 1688.com. Consider:
- Direct translation of the product
- Common Chinese names/slang for this product
- Related product categories
- Keywords Chinese suppliers actually use

Return ONLY a JSON array of Chinese strings, nothing else. Example:
["复合弓", "反曲弓 狩猎", "弓箭套装"]

Be specific and practical - these should be terms that actually work on 1688.`
        }
      ]
    });

    // Parse the response
    let chineseTerms: string[] = [];
    const textBlock = response.content.find(block => block.type === 'text');
    
    if (textBlock && textBlock.type === 'text') {
      try {
        // Clean the response
        let jsonStr = textBlock.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        chineseTerms = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse Chinese terms:', textBlock.text);
        // Fallback: try to extract Chinese characters
        const matches = textBlock.text.match(/[\u4e00-\u9fff]+/g);
        if (matches) {
          chineseTerms = matches.slice(0, 5);
        }
      }
    }

    return NextResponse.json({ chineseTerms });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate search term' },
      { status: 500 }
    );
  }
}

