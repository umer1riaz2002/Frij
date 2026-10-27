'use client';

import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { isPlausibleKey, markIntroSeen, setSpoonacularKey } from '@/lib/apiKey';
import MagneticButton from './MagneticButton';


interface Props {
  onDone: () => void;
}

// Button with the blob shape.
const BLOB_BUTTON =
  'group relative flex w-60 items-center justify-center px-10 text-center text-sm font-medium text-yellow disabled:cursor-not-allowed disabled:opacity-40';

function blobMask(file: string): CSSProperties {
  const url = `url('/${file}')`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  };
}

export default function IntroScreen({ onDone }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [showKeyField, setShowKeyField] = useState(false);
  // null = still checking. The demo button stays enabled unless the server explicitly says it has no demo key to avoid failed checks.
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
      setError('Invalid Key');
      return;
    }
    if (!setSpoonacularKey(trimmed)) {
      setError('Browser failed to save key');
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
    <main
      className="flex min-h-screen items-center justify-center px-6 py-10"
      style={{
        backgroundImage: 'url(/blob-haikei.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-3xl">
        <div className="mb-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-purple ">Frij</h1>
          <p className="mt-2 text-sm text-mauve">Welcome!</p>
        </div>

        <div className="flex flex-col items-center md:flex-row md:justify-center">
          <MagneticButton
            onClick={() => setShowKeyField((open) => !open)}
            expanded={showKeyField}
            controls="intro-key-form"
            className={`${BLOB_BUTTON} aspect-[9/8]`}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-mauve transition-colors group-hover:bg-purple "
              style={blobMask('blob-btn-a.svg')}
            />
            <span
              className="absolute flex items-center justify-center text-center text-balance"
              style={{ left: '30.8%', top: '23.5%', width: '52.5%', height: '32.9%' }}
            >
            Enter your Spoonacular key
            </span>
          </MagneticButton>

          <MagneticButton
            onClick={chooseDemo}
            disabled={demoAvailable === false}
            className={`${BLOB_BUTTON} aspect-square`}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-mauve transition-colors group-hover:bg-purple "
              style={blobMask('blob-btn-b.svg')}
            />
            <span
              className="absolute flex items-center justify-center text-center text-balance"
              style={{ left: '7.5%', top: '36.6%', width: '69.2%', height: '37.4%' }}
            >
            Or just use our demo key :)
            </span>
          </MagneticButton>
        </div>

        <p className="text-center text-xs text-mauve">
          {demoAvailable === false
            ? 'No demo key is set up on this server yet, so you’ll need your own for now.'
            : 'Demo key is rate-limited.'}
        </p>

        {showKeyField && (
          <form id="intro-key-form" onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md rounded-2xl bg-peach p-5">
            <label htmlFor="intro-key" className="font-display text-sm font-medium text-purple ">
              Spoonacular key
            </label>
            <input
              id="intro-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError('');
              }}
              placeholder="paste your key"
              className="mt-2 w-full rounded-lg bg-purple  px-3 py-2 font-mono text-sm text-yellow outline-none placeholder:text-mauve focus:ring-2 focus:ring-yellow"
            />
            {error && <p className="mt-2 text-xs text-coral">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="submit" className="rounded-lg bg-mauve px-4 py-2 text-sm font-medium text-yellow hover:bg-mauve/80">
                Continue
              </button>
              <a
                href="https://spoonacular.com/food-api"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-mauve hover:text-yellow"
              >
                or use a free demo key
              </a>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
