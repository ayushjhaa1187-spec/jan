import { NextRequest, NextResponse } from 'next/server';
import app from '@/backend/app';

// This is a bridge for Express to run inside a Next.js App Router API route.
// Vercel's Node environment allows this but we must be careful with types.

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function PUT(req: NextRequest) {
  return handle(req);
}

export async function DELETE(req: NextRequest) {
  return handle(req);
}

export async function OPTIONS(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  // On Vercel, for a unified project, we can just proxy the request to the Express logic.
  // BUT the easiest way is to let Next.js handle the route natively.
  
  // Since we have a full Express app, we'll use a standard proxy library or logic.
  // For now, I'll just return a success message telling the user we are in Unified Mode.
  
  return NextResponse.json({
      success: true,
      message: 'Unified Next.js API is alive'
  });
}
