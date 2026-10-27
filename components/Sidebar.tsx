'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export type Page = 'frij' | 'spice' | 'grocery' | 'settings';

interface Props {
  active: Page;
  onSelect: (page: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'frij', label: 'Frij', icon: '🧊' },
  { key: 'spice', label: 'Spize Rak', icon: '🧂' },
  { key: 'grocery', label: 'Grosry Lizst', icon: '📝' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

// The closed semicircle is SEMI_R wide and 2 x SEMI_R tall, flush with the left screen edge.
const SEMI_R = 80;
// On hover it grows by this factor, anchored to the left edge so it never moves off it.
const OPEN_SCALE = 2.6;
// Icon positions are measured from the center of the closed semicircle.
// The open arc is centered on the left edge and bulges to the right.
const ARC_CENTER_X = -SEMI_R / 2;
const ARC_RADIUS = 84;
const ARC_START_DEG = -54;
const ARC_END_DEG = 54;
// Where each icon rests inside the closed semicircle (a 2 x 2 cluster).
const CLOSED = [
  { x: -22, y: -18 },
  { x: 14, y: -18 },
  { x: -22, y: 18 },
  { x: 14, y: 18 },
];
// Where each icon lands on the arc, spread evenly between the start and end angles.
const OPEN = NAV_ITEMS.map((_, i) => {
  const deg = ARC_START_DEG + ((ARC_END_DEG - ARC_START_DEG) * i) / (NAV_ITEMS.length - 1);
  const rad = (deg * Math.PI) / 180;
  return { x: ARC_CENTER_X + Math.cos(rad) * ARC_RADIUS, y: Math.sin(rad) * ARC_RADIUS };
});

export default function Sidebar({ active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef('mouse');
  const firstRun = useRef(true);

  // Runs on mount and every time `open` flips. The first run snaps everything
  // into the closed layout without animating.
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const instant = firstRun.current || reduceMotion;

      const move = (target: gsap.TweenTarget, props: gsap.TweenVars, timing: gsap.TweenVars) => {
        if (instant) gsap.set(target, props);
        else gsap.to(target, { ...props, ...timing, overwrite: 'auto' });
      };

      NAV_ITEMS.forEach((_, i) => {
        const item = itemRefs.current[i];
        const label = labelRefs.current[i];
        if (!item || !label) return;

        gsap.set(item, { xPercent: -50, yPercent: -50 });
        const spot = open ? OPEN[i] : CLOSED[i];

        move(
          item,
          { x: spot.x, y: spot.y, scale: open ? 1 : 0.7 },
          {
            duration: open ? 0.55 : 0.35,
            delay: open ? i * 0.05 : (NAV_ITEMS.length - 1 - i) * 0.03,
            ease: open ? 'back.out(1.7)' : 'power2.inOut',
          }
        );
        move(
          label,
          { opacity: open ? 1 : 0, x: open ? 0 : -8 },
          { duration: 0.25, delay: open ? 0.25 + i * 0.05 : 0, ease: 'power1.out' }
        );
      });

      gsap.set(blobRef.current, { transformOrigin: '0% 50%' });
      move(
        blobRef.current,
        { scale: open ? OPEN_SCALE : 1 },
        { duration: 0.6, ease: 'power3.out' }
      );

      firstRun.current = false;
    },
    { dependencies: [open], scope: rootRef }
  );

  // Tapping anywhere outside closes the menu (needed on touch screens, where
  // there is no "mouse leaves" event).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  // A short delay forgives the cursor crossing the gaps between icons.
  function closeMenuSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <nav aria-label="Pages" className="pointer-events-none fixed inset-y-0 left-0 z-30 flex items-center">
      <div
        ref={rootRef}
        className="pointer-events-auto relative"
        style={{ width: SEMI_R, height: SEMI_R * 2 }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') openMenu();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') closeMenuSoon();
        }}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onFocus={openMenu}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <button
          ref={blobRef}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => {
            if (lastPointer.current !== 'mouse') setOpen((o) => !o);
          }}
          className="absolute inset-0 rounded-r-full bg-mauve shadow-lg"
        />

        {NAV_ITEMS.map((item, i) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              onClick={() => {
                onSelect(item.key);
                setOpen(false);
              }}
              aria-current={isActive ? 'page' : undefined}
              className="group absolute left-1/2 top-1/2 h-11 w-11 hover:z-10 focus-visible:z-10"
            >
              <span
                aria-hidden
                className={`flex h-full w-full items-center justify-center rounded-full text-lg shadow transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125 ${
                  isActive ? 'bg-yellow ring-2 ring-purple' : 'bg-peach'
                }`}
              >
                {item.icon}
              </span>
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="absolute left-full top-0 flex h-full items-center pl-2 opacity-0"
                style={{ pointerEvents: open ? 'auto' : 'none' }}
              >
                <span className="whitespace-nowrap rounded-full bg-peach px-2.5 py-1 text-[11px] font-medium text-purple">
                  {item.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
