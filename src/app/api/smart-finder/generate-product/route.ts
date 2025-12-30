import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName, priceCNY, supplierName, images, url } = await request.json();

    // Build the message content
    const messageContent: any[] = [];

    // Add images for AI to analyze (if any are base64 or URLs)
    const imagePromises = images?.slice(0, 3).map(async (imageUrl: string, index: number) => {
      // Check if it's a base64 image
      if (imageUrl.startsWith('data:image')) {
        const base64Match = imageUrl.match(/data:image\/(\w+);base64,(.+)/);
        if (base64Match) {
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: `image/${base64Match[1]}`,
              data: base64Match[2],
            },
          };
        }
      }
      // For URLs, we'll describe them in text since Claude can't fetch URLs directly
      return null;
    }) || [];

    const resolvedImages = (await Promise.all(imagePromises)).filter(Boolean);
    
    // Add images to message
    resolvedImages.forEach((img) => {
      if (img) messageContent.push(img);
    });

    // Add the text prompt
    messageContent.push({
      type: 'text',
      text: `You are an expert e-commerce copywriter for the South African market. Create a professional product listing.

PRODUCT INFORMATION:
- Product Name: ${productName || 'Unknown product'}
- Price: ¥${priceCNY || 'Unknown'} CNY
- Supplier: ${supplierName || 'Chinese supplier'}
- Source URL: ${url || 'N/A'}
${resolvedImages.length > 0 ? `- I've attached ${resolvedImages.length} product image(s) for you to analyze` : ''}

YOUR TASKS:
1. ${resolvedImages.length > 0 ? 'Look at the images carefully. Extract ANY Chinese text you see and translate it to English. Note any product specifications, features, or details visible.' : 'Based on the product name, create appropriate content.'}

2. Create a compelling product listing with:
   - A professional, SEO-friendly title (max 80 chars, no Chinese characters)
   - A detailed description (200-400 words) that:
     * Highlights key features and benefits
     * Uses South African English spelling
     * Sounds professional, not cheap/spammy
     * Includes bullet points for specifications
     * Has a persuasive call-to-action
     * Does NOT mention China, import, or wholesale
   - A short description (1-2 sentences, max 150 chars)
   - 5-8 relevant SEO tags

3. Determine the best product category from: Electronics, Fashion, Sports & Outdoors, Home & Garden, Beauty, Toys & Games, Accessories, Other

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Professional Product Title Here",
  "description": "Full product description with features, benefits, and bullet points...",
  "shortDescription": "Brief catchy summary",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Category Name",
  "extractedText": "Any Chinese text found in images, translated to English (or null if none)"
}

IMPORTANT: Return ONLY valid JSON, no other text or markdown.`
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: messageContent,
        }
      ]
    });

    // Parse the response
    let productData: any = {};
    const textBlock = response.content.find(block => block.type === 'text');
    
    if (textBlock && textBlock.type === 'text') {
      try {
        let jsonStr = textBlock.text.trim();
        // Clean markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        productData = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse AI response:', textBlock.text);
        // Fallback
        productData = {
          title: productName || 'Imported Product',
          description: `Quality ${productName || 'product'} available now. Features premium construction and excellent value for money. Perfect for South African customers looking for reliable products at competitive prices.\n\n• High-quality materials\n• Durable construction\n• Great value\n• Fast delivery available`,
          shortDescription: `Premium ${productName || 'product'} - great quality at an excellent price.`,
          tags: ['quality', 'value', 'imported'],
          category: 'Other',
          extractedText: null,
        };
      }
    }

    return NextResponse.json(productData);

  } catch (error) {
    console.error('Product generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product listing' },
      { status: 500 }
    );
  }
}






