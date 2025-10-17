// app/api/interview/route.js
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export const runtime = 'edge';

// GET /api/interview -> simple health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'interview-api' });
}

// POST /api/interview -> create a session id (optional)
export async function POST() {
  const sessionId = uuid();
  return NextResponse.json({
    sessionId,
    createdAt: new Date().toISOString(),
  });
}