'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  clearSpoonacularKey,
  getSpoonacularKey,
  isPlausibleKey,
  maskKey,
  setSpoonacularKey,
} from '@/lib/apiKey';

export default function ApiKeySettings() {
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // localStorage doesn't exist during server render, so read it after mount.
  useEffect(() => {
    setSavedKey(getSpoonacularKey());
  }, []);

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice('');
    const trimmed = draft.trim();
    if (!isPlausibleKey(trimmed)) {
      setError('That doesn’t look like an API key. Paste just the key itself, with no spaces or quotes.');
      return;
    }
    if (!setSpoonacularKey(trimmed)) {
      setError('This browser blocked saving it (private window or blocked site data).');
      return;
    }
    setError('');
    setSavedKey(trimmed);
    setDraft('');
    setNotice('Key saved. Your next recipe search will use it.');
  }

  function handleRemove() {
    clearSpoonacularKey();
    setSavedKey(null);
    setNotice('Key removed from this browser.');
    setError('');
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-sm font-medium uppercase tracking-wide text-muted">Settings</h2>

      <div className="rounded-2xl bg-panel p-4">
        <h3 className="font-display text-sm font-medium text-ice">Recipe API - Spoonacular</h3>
        <p className="mt-1 text-xs text-muted">
          Paste your own Spoonacular key and Frij will use it for recipe searches. Get a free one at{' '}
          <a
            href="https://spoonacular.com/food-api"
            target="_blank"
            rel="noreferrer"
            className="text-mint hover:underline"
          >
            spoonacular.com/food-api
          </a>
          . If you leave this empty, Frij falls back to the key set on the server, if there is one.
        </p>

        <p className="mt-3 text-xs text-ice">
          Status:{' '}
          {savedKey ? (
            <span className="font-mono text-mint">key saved ({maskKey(savedKey)})</span>
          ) : (
            <span className="text-yolk">no key saved in this browser</span>
          )}
        </p>

        <form onSubmit={handleSave} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-muted" htmlFor="spoonacular-key">
              {savedKey ? 'Replace key' : 'API key'}
            </label>
            <input
              id="spoonacular-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError('');
              }}
              placeholder="paste your key"
              className="w-64 rounded-lg bg-panelRaised px-3 py-2 font-mono text-sm text-ice outline-none focus:ring-2 focus:ring-mint"
            />
          </div>
          <button type="submit" className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-frost">
            Save key
          </button>
          {savedKey && (
            <button type="button" onClick={handleRemove} className="text-sm text-muted hover:text-coral">
              Remove key
            </button>
          )}
        </form>

        {error && <p className="mt-2 text-xs text-coral">{error}</p>}
        {notice && !error && <p className="mt-2 text-xs text-mint">{notice}</p>}

        <p className="mt-4 text-xs text-muted">
          Where it&apos;s kept: only in this browser&apos;s local storage, never in a database. Each search sends it to
          Frij&apos;s server, which passes it straight to Spoonacular and doesn&apos;t store or log it. It won&apos;t
          follow you to another browser or device. Don&apos;t save a key on a shared computer, since anyone using this
          browser profile could read it.
        </p>
      </div>
    </section>
  );
}
