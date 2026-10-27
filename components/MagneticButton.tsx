'use client';

import { MouseEvent as ReactMouseEvent, ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  zoneClassName?: string;
  strength?: number;
  expanded?: boolean;
  controls?: string;
}

// The zone is the invisible area around the button. The button starts
// following the cursor as soon as it enters the zone, and springs back
// to the center when the cursor leaves.
export default function MagneticButton({
  children,
  onClick,
  disabled,
  className,
  zoneClassName = 'p-10',
  strength = 0.4,
  expanded,
  controls,
}: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: zoneRef });

  const onMove = contextSafe((e: ReactMouseEvent<HTMLDivElement>) => {
    const zone = zoneRef.current;
    const btn = btnRef.current;
    if (!zone || !btn) return;
    const rect = zone.getBoundingClientRect();
    const x = gsap.utils.mapRange(rect.left, rect.right, -rect.width / 2, rect.width / 2, e.clientX);
    const y = gsap.utils.mapRange(rect.top, rect.bottom, -rect.height / 2, rect.height / 2, e.clientY);

    gsap.to(btn, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: true,
    });
  });

  const onLeave = contextSafe(() => {
    const btn = btnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.4)',
      overwrite: true,
    });
  });

  return (
    <div ref={zoneRef} onMouseMove={onMove} onMouseLeave={onLeave} className={zoneClassName}>
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={controls}
        className={className}
      >
        {children}
      </button>
    </div>
  );
}
