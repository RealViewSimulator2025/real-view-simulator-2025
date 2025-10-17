// app/api/interview/route.js
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'interview-api' });
}

export async function POST() {
  const sessionId = uuid();
  return NextResponse.json({
    sessionId,
    createdAt: new Date().toISOString(),
  });
}