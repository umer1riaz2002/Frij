import { NextRequest, NextResponse } from 'next/server';

// Anthropic API model ID for Claude Sonnet 5.5.
const MODEL = 'claude-sonnet-5-5';

interface ExtractedItem {
  name: string;
  qty: number;
  unit?: string;
}

function buildPrompt(mode: 'receipt' | 'shelf'): string {
  if (mode === 'receipt') {
    return `You're looking at a grocery store receipt. List every food/grocery line item you can identify - skip subtotals, tax, totals, loyalty numbers, and non-food fees. For each item, translate the receipt's abbreviated text into a normal ingredient name (e.g. "CHKN BRST BNLESS" becomes "chicken breast") and give your best guess at quantity and unit. Respond with ONLY a JSON array, no other text, in this exact shape: [{"name": "chicken breast", "qty": 2, "unit": "lb"}]. If you can't confidently read the receipt, respond with an empty array [].`;
  }
  return `You're looking at a photo of food items (a fridge, pantry shelf, or counter). Identify each distinct food item visible. For each, give a short plain ingredient name and your best guess at quantity (default to 1 if uncertain) and a sensible unit (pcs, g, ml, etc). Respond with ONLY a JSON array, no other text, in this exact shape: [{"name": "milk", "qty": 1, "unit": "l"}]. If nothing food-related is clearly visible, respond with an empty array [].`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Receipt scanning needs an Anthropic API key. Add ANTHROPIC_API_KEY to .env.local and restart the dev server.',
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { image, mode } = body as { image?: string; mode?: string };

  if (!image) {
    return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  }

  const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Image format not recognized.' }, { status: 400 });
  }
  const mediaType = match[1];
  const base64Data = match[2];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
              { type: 'text', text: buildPrompt(mode === 'shelf' ? 'shelf' : 'receipt') },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[api/scan-receipt] Anthropic error', res.status, errText);
      return NextResponse.json(
        { error: 'Could not reach the vision service. Try again in a moment.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textBlock = data.content?.find((c: any) => c.type === 'text');
    const rawText: string = textBlock?.text ?? '[]';

    let items: ExtractedItem[] = [];
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        items = parsed
          .filter((i) => i && typeof i.name === 'string' && i.name.trim())
          .map((i) => ({
            name: String(i.name).trim(),
            qty: typeof i.qty === 'number' && i.qty > 0 ? i.qty : 1,
            unit: typeof i.unit === 'string' && i.unit.trim() ? i.unit.trim() : undefined,
          }));
      }
    } catch {
      return NextResponse.json(
        { error: "Couldn't read that image clearly - try a clearer photo or add items manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error('[api/scan-receipt]', err);
    return NextResponse.json(
      { error: 'Could not reach the vision service. Try again in a moment.' },
      { status: 502 }
    );
  }
}
