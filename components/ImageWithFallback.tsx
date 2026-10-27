'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
}

export default function ImageWithFallback({ src, alt, fallbackLabel, className }: Props) {
  const [errored, setErrored] = useState(false);
  const letter = fallbackLabel.trim().charAt(0).toUpperCase() || '?';

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-yolk  bg-purple font-mono text-xs text-yolk  ${className ?? ''}`}
        aria-hidden
        title="No photo available"
      >
        {letter}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />
  );
}
