// app/api/transcribe/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('audio')) {
      return NextResponse.json({ error: 'Send audio blob' }, { status: 400 });
    }

    // Works on Node and Edge; fine to keep universal approach
    const bytes = await req.arrayBuffer();
    const file = new File([bytes], 'answer.webm', { type: contentType });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcript.text || '' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}