import { NextRequest, NextResponse } from 'next/server';

// Looks up the Spoonacular image filename for one ingredient name.
// Uses the same key rules as app/api/recipes/route.ts: the visitor's own key arrives in a
// header, the server key from .env.local is only a fallback, and the key is never logged.
const KEY_HEADER = 'x-spoonacular-key';
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;
const MAX_TERM_LENGTH = 60;

export async function GET(request: NextRequest) {
  const term = (request.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase();
  if (!term || term.length > MAX_TERM_LENGTH) {
    return NextResponse.json({ error: 'Missing or too long ingredient name.' }, { status: 400 });
  }

  const headerKey = request.headers.get(KEY_HEADER)?.trim();
  if (headerKey && !KEY_PATTERN.test(headerKey)) {
    return NextResponse.json({ error: 'Invalid API key format.', code: 'bad_key' }, { status: 400 });
  }
  const apiKey = headerKey || process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No API key.', code: 'no_key' }, { status: 401 });
  }

  try {
    const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
      term
    )}&number=1&apiKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: 'Key rejected.', code: 'bad_key' }, { status: 401 });
    }
    if (res.status === 402) {
      return NextResponse.json({ error: 'Daily points used up.', code: 'quota' }, { status: 402 });
    }
    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limited.', code: 'rate_limited' }, { status: 429 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Lookup failed.' }, { status: 502 });
    }

    const data = await res.json();
    const image: unknown = data?.results?.[0]?.image;
    // Only plain file names are passed on, so nothing odd can end up inside an image URL.
    const safe = typeof image === 'string' && /^[A-Za-z0-9._-]{1,120}$/.test(image) ? image : null;
    return NextResponse.json({ image: safe });
  } catch (err) {
    console.error('[api/ingredient-image]', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 502 });
  }
}
