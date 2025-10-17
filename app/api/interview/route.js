// app/api/interview/route.js
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Simple health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'interview-api' });
}

// Optional: create a session id
export async function POST() {
  const sessionId = uuid();
  return NextResponse.json({
    sessionId,
    createdAt: new Date().toISOString(),
  });
}