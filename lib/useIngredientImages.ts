'use client';

import { useEffect, useState } from 'react';
import { getSpoonacularKey } from '@/lib/apiKey';

// Where Spoonacular serves ingredient pictures. The file name comes from their ingredient search.
const IMAGE_BASE = 'https://spoonacular.com/cdn/ingredients_100x100/';
const STORAGE_KEY = 'frij:ingredient-images:v1';
const MAX_PARALLEL = 2;

// term -> file name, or null when Spoonacular has no picture for that term.
type Cache = Record<string, string | null>;

let memory: Cache | null = null;
const inFlight = new Set<string>();
// Set after a quota, key or rate-limit error so the rest of the session stops spending calls.
let blocked = false;

function load(): Cache {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    memory = {};
  }
  return memory;
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory ?? {}));
  } catch {
    // Storage unavailable: pictures are looked up again next visit.
  }
}

async function lookup(term: string): Promise<void> {
  const key = getSpoonacularKey();
  try {
    const res = await fetch(`/api/ingredient-image?q=${encodeURIComponent(term)}`, {
      headers: key ? { 'x-spoonacular-key': key } : {},
    });
    if (res.status === 401 || res.status === 402 || res.status === 429) {
      blocked = true;
      return;
    }
    if (!res.ok) return;
    const data: { image: string | null } = await res.json();
    load()[term] = data.image;
    save();
  } catch {
    // Network problem: leave it uncached so a later render can try again.
  } finally {
    inFlight.delete(term);
  }
}

/**
 * Returns a picture URL for each search term: a string when found, null when Spoonacular has none,
 * and undefined while it is still being looked up. Results are saved in this browser, so each term
 * costs one Spoonacular request, ever.
 */
export function useIngredientImages(terms: string[]): Record<string, string | null | undefined> {
  const [, bump] = useState(0);
  const wanted = Array.from(new Set(terms.map((t) => t.trim().toLowerCase()).filter(Boolean)));
  const signature = wanted.join('|');

  useEffect(() => {
    let cancelled = false;
    const cache = load();
    const queue = wanted.filter((t) => !(t in cache) && !inFlight.has(t));
    if (blocked || queue.length === 0) return;

    queue.forEach((t) => inFlight.add(t));

    async function worker() {
      while (queue.length > 0 && !blocked) {
        const term = queue.shift();
        if (!term) break;
        await lookup(term);
        if (!cancelled) bump((n) => n + 1);
      }
      // Anything this worker did not get to must be released so a later render can pick it up.
      queue.forEach((t) => inFlight.delete(t));
    }

    for (let i = 0; i < MAX_PARALLEL; i++) void worker();
    return () => {
      cancelled = true;
    };
    // `signature` stands in for the list of terms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const out: Record<string, string | null | undefined> = {};
  if (typeof window === 'undefined') return out;
  const cache = load();
  for (const t of wanted) {
    const file = cache[t];
    out[t] = file === undefined ? undefined : file === null ? null : IMAGE_BASE + encodeURIComponent(file);
  }
  return out;
}
