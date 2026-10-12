'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getSpoonacularKey, hasSeenIntro } from '@/lib/apiKey';
import IntroScreen from './IntroScreen';

type GateState = 'loading' | 'intro' | 'app';

export default function IntroGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>('loading');

  // localStorage only exists in the browser, so the decision happens after
  // mount. Anyone who already has a saved key, or has already made a choice
  // on the intro, goes straight into the app.
  useEffect(() => {
    setState(getSpoonacularKey() || hasSeenIntro() ? 'app' : 'intro');
  }, []);

  // Render nothing while deciding - the page background is already the dark
  // theme color, so there's no white flash.
  if (state === 'loading') return null;
  if (state === 'intro') return <IntroScreen onDone={() => setState('app')} />;
  return <>{children}</>;
}
