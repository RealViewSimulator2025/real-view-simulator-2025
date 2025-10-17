import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { qa } = await req.json(); // [{q, a}, ...]
    if (!qa?.length) return NextResponse.json({ error: 'No QA' }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are an interview coach. Given the Q&A below, provide:
1) A brief overall assessment (tone, clarity, structure).
2) 3 concise strengths.
3) 3 specific improvements with example phrasing.
4) A 10/10 overall score and 10/10 confidence score.

Q&A:
${qa.map((x,i)=>`Q${i+1}: ${x.q}\nA${i+1}: ${x.a}`).join('\n\n')}
`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const feedback = res.choices?.[0]?.message?.content ?? 'No feedback';
    return NextResponse.json({ feedback });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}