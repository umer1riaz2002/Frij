# Frij

A digital fridge: ingredients live as a stackable inventory, and you turn
them into filterable recipe suggestions without much deciding on your own.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Spoonacular for recipe search (required - see setup below)
- A Next.js Route Handler (`app/api/recipes/route.ts`) that calls
  Spoonacular server-side, so the API key never reaches the browser
- All state (fridge, spice rack, grocery list) persists to `localStorage`
  client-side - no database needed for a prototype

## Pages

Navigate via the dock on the left (icon-only on narrow screens):

- **Frij** - your fridge inventory (stackable slots, grouped by category,
  with photos) alongside the recipe finder
- **Spize Rak** - seasonings and spices, no quantities, just what's on
  hand. Anything in here counts toward recipe matching the same as a
  fridge item does.
- **Grosry Lizst** - a shopping list. Adding something already in your
  fridge shows a dismissable "already have X in fridge" notice per item.

## Setup

```bash
npm install
```

Spoonacular is required (there's no fallback/demo mode):

1. Get a free key at https://spoonacular.com/food-api (free tier: 150
   requests/day)
2. `cp .env.local.example .env.local`
3. Paste your key into `SPOONACULAR_API_KEY`
4. `npm run dev`

Open http://localhost:3000. Node 20.9+ is required (Next.js 16's minimum).

## How it works

- Adding an ingredient either creates a new stack slot or increments an
  existing one (same name + unit = same slot), like a game inventory.
  Unit and category are both auto-guessed from the name you type (e.g.
  "milk" -> Dairy, ml) but stay editable - once you manually change either,
  auto-guessing stops for that entry.
- A separate "Search & photo as" field auto-strips brand/pack-size noise
  (e.g. "Costco green onion" -> "green onion") since that's what actually
  gets sent to recipe search and ingredient-photo lookups. The display
  name in your fridge is untouched.
- "Find recipes" sends your fridge + Spize Rak search terms to
  `/api/recipes`, which calls Spoonacular and then runs results through
  two extra passes: re-verifying "missing" ingredients with a word-based
  matcher (`lib/ingredientMatch.ts`) that catches things Spoonacular's own
  matching misses (plurals, "juice of lime" vs "lime"), and resolving
  composite ingredients (e.g. "pico de gallo sauce") by live-looking-up a
  real recipe for that item and checking whether the fridge covers its
  ingredients - all sourced dynamically, no hardcoded ingredient
  dictionary.
- Recipes are sorted least-to-most missing ingredients, then filterable by
  effort tags (`quick`, `one-pot`, `hands-off`, `minimal`) computed from
  Spoonacular's cook time and step data.
- Ingredient photos come from TheMealDB's free ingredient-image endpoint -
  this is unrelated to recipe search (a different, independent free
  resource), so it stays even though recipe search itself is
  Spoonacular-only. A miss falls back to a plain letter avatar rather than
  a broken image or a misleadingly specific one.

## What I'd extend first

1. **Expiry-aware sorting.** An optional "use by" date per fridge item,
   surfaced by default - probably the single highest-leverage feature for
   reducing decision fatigue, since it turns "what should I cook" into
   "here's what's about to go bad."
2. **A "cook this" action.** Selecting a recipe could auto-decrement the
   fridge ingredients it used, closing the loop instead of leaving the
   user to update inventory by hand.
3. **Barcode scanning or a quick-add list** for faster fridge entry, since
   manual typing is itself a source of friction.
4. **Real accounts + a database** (e.g. Postgres via Prisma, or Supabase)
   once the app needs to sync across devices instead of living in one
   browser's `localStorage`.
5. **Real URL-based routes** for the three pages (currently client-side
   tab state, not `/frij` / `/spize-rak` / `/grosry-lizst` in the address
   bar) if deep-linking or browser back/forward between pages becomes
   useful.
