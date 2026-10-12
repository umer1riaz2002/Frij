import { NextResponse } from 'next/server';

// Lets the intro screen know whether the "use our demo key" option will work.
// This only reports whether a server key exists - it never returns the key.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.SPOONACULAR_API_KEY) });
}
