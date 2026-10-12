'use client';

import { FormEvent, useEffect, useState } from 'react';
import { isPlausibleKey, markIntroSeen, setSpoonacularKey } from '@/lib/apiKey';

interface Props {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  // null = still checking. The demo button stays enabled unless the server
  // explicitly says it has no demo key, so a failed check never blocks anyone.
  const [demoAvailable, setDemoAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/demo-status')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDemoAvailable(Boolean(data.available));
      })
      .catch(() => {
        // Leave as null (unknown) - the demo button remains usable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!isPlausibleKey(trimmed)) {
      setError('That doesn’t look like an API key. Paste just the key itself, with no spaces or quotes.');
      return;
    }
    if (!setSpoonacularKey(trimmed)) {
      setError('This browser blocked saving it (private window or blocked site data).');
      return;
    }
    markIntroSeen();
    onDone();
  }

  function chooseDemo() {
    markIntroSeen();
    onDone();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ice">Frij</h1>
          <p className="mt-2 text-sm text-muted">Open it up, see what you&apos;ve got, stop deciding.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl bg-panel p-5">
            <label htmlFor="intro-key" className="font-display text-sm font-medium text-ice">
              Enter your Spoonacular key
            </label>
            <input
              id="intro-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError('');
              }}
              placeholder="paste your key"
              className="mt-2 w-full rounded-lg bg-panelRaised px-3 py-2 font-mono text-sm text-ice outline-none placeholder:text-muted focus:ring-2 focus:ring-mint"
            />
            {error && <p className="mt-2 text-xs text-coral">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="submit" className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-frost">
                Continue
              </button>
              <a
                href="https://spoonacular.com/food-api"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted hover:text-ice"
              >
                Don&apos;t have one? Get a free key
              </a>
            </div>
          </form>

          <div className="flex flex-col justify-center rounded-2xl bg-panel p-5">
            <button
              type="button"
              onClick={chooseDemo}
              disabled={demoAvailable === false}
              className="rounded-lg bg-panelRaised px-4 py-3 text-sm font-medium text-ice transition hover:bg-frost disabled:cursor-not-allowed disabled:opacity-40"
            >
              Or just use our demo key :)
            </button>
            <p className="mt-3 text-xs text-muted">
              {demoAvailable === false
                ? 'No demo key is set up on this server yet, so you’ll need your own for now.'
                : 'Everyone using the demo shares one daily limit, so it can run out. You can add your own key any time in Settings.'}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          A key you enter stays in this browser only. It&apos;s passed to Spoonacular when you search for recipes and
          never stored on our side.
        </p>
      </div>
    </main>
  );
}
