import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { AUTO_TAG_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { title, content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const userPrompt = `Note title: ${title || 'Untitled'}\n\nContent: ${content}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: AUTO_TAG_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ tags: [] });
    }

    // Parse JSON array from response
    try {
      const tags = JSON.parse(textContent.text);
      if (Array.isArray(tags)) {
        return NextResponse.json({ tags: tags.slice(0, 5) });
      }
    } catch {
      // If parsing fails, try to extract tags from text
      const match = textContent.text.match(/\[.*\]/);
      if (match) {
        try {
          const tags = JSON.parse(match[0]);
          if (Array.isArray(tags)) {
            return NextResponse.json({ tags: tags.slice(0, 5) });
          }
        } catch {
          // Fallback
        }
      }
    }

    return NextResponse.json({ tags: [] });
  } catch (error) {
    console.error('AI tags error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
