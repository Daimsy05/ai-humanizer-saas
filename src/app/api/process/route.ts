import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  // 2. Check Subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .single();

  // 3. Check Limits
  const { text, mode } = await req.json();
  const wordCount = text.trim().split(/\s+/).length;
  const FREE_TIER_LIMIT = 125;

  if (!subscription && wordCount > FREE_TIER_LIMIT) {
    return NextResponse.json(
      { error: `Free tier is limited to ${FREE_TIER_LIMIT} words. Please upgrade for unlimited access.` },
      { status: 402 }
    );
  }

  // 4. Process based on Mode
  if (mode === 'humanize') {
    // Pass 1: Strip AI patterns
    const pass1 = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Rewrite the following text to remove AI patterns. Remove filler transitions like "Furthermore" and "In conclusion". Vary sentence lengths dramatically. Use everyday vocabulary. Output only the rewritten text.`,
      prompt: text,
      temperature: 0.85,
    });

    // Pass 2: Polish and stream to user
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: `Polish the following text so it reads like a real person wrote it. Keep it natural. Do not add new ideas. Output only the polished text.`,
      prompt: pass1.text,
      temperature: 0.7,
    });
    return result.toTextStreamResponse();
  } else {
    // Paraphrase mode (Single pass)
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert paraphraser. Rewrite the text to improve clarity and flow. Use different words and sentence structures. Output only the rewritten text.`,
      prompt: text,
      temperature: 0.7,
    });
    return result.toTextStreamResponse();
  }
}