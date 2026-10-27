'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { Category, FridgeItem } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { useIngredientImages } from '@/lib/useIngredientImages';
import AddIngredientForm from './AddIngredientForm';

export interface ShelfGroup {
  value: Category;
  label: string;
  emoji: string;
  items: FridgeItem[];
}

interface Props {
  groups: ShelfGroup[];
  // The search text from the fridge search box. While it is not empty, drawers stay open
  // so matching items are never hidden inside a closed drawer.
  query: string;
  onAdd: (name: string, qty: number, unit: string, category: Category, searchTerm: string) => void;
  onAdjust: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

// Categories listed here get a pull-out drawer. Every other category is a shelf.
const DRAWER_CATEGORIES: Category[] = ['protein', 'produce'];

// Height of one shelf row. The shelf boards are drawn from this number, so keep it in sync with ROW_CLASS.
const ROW_REM = 7;
const ROW_CLASS = 'auto-rows-[7rem]';
const BOARD_PX = 6;

// Draws a board at the bottom of every row, whatever width the grid has.
const BOARDS: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${ROW_REM}rem - ${BOARD_PX}px), rgba(255,255,255,0.35) calc(${ROW_REM}rem - ${BOARD_PX}px), rgba(255,255,255,0.35) ${ROW_REM}rem)`,
};

// A round white plate with the ingredient picture on it. Without a picture (still loading, no match,
// or the image failed to load) the plate shows the item's first letter instead.
function IngredientIcon({ url, name }: { url: string | null | undefined; name: string }) {
  const [failed, setFailed] = useState(false);
  const letter = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden className="font-mono text-lg text-mauve">
          {letter}
        </span>
      )}
    </div>
  );
}

interface GridProps {
  category: Category;
  categoryLabel: string;
  onAddTo: (category: Category) => void;
  items: FridgeItem[];
  images: Record<string, string | null | undefined>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdjust: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

function ItemGrid({ category, categoryLabel, onAddTo, items, images, selectedId, onSelect, onAdjust, onRemove }: GridProps) {
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] ${ROW_CLASS}`}
      style={BOARDS}
    >
      {items.map((item) => {
        const selected = selectedId === item.id;
        return (
          <div key={item.id} className="relative flex flex-col items-center justify-end pb-2">
            <button
              type="button"
              onClick={() => onSelect(selected ? null : item.id)}
              aria-pressed={selected}
              aria-label={`${item.name}, ${item.qty} ${item.unit}`}
              className={`relative rounded-xl p-1 transition-transform duration-150 hover:scale-110 focus-visible:scale-110 ${
                selected ? 'scale-110 bg-white/20' : ''
              }`}
            >
              <IngredientIcon url={images[item.searchTerm.trim().toLowerCase()]} name={item.name} />
              <span className="absolute -right-1 -top-1 min-w-[1.4rem] rounded-full bg-yellow px-1.5 text-center font-mono text-[11px] font-semibold leading-5 text-purple">
                {item.qty}
              </span>
            </button>

            {selected ? (
              <div className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onAdjust(item.id, -1)}
                  aria-label={`Remove one ${item.name}`}
                  className="h-8 w-8 rounded-full bg-peach text-purple"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => onAdjust(item.id, 1)}
                  aria-label={`Add one ${item.name}`}
                  className="h-8 w-8 rounded-full bg-peach text-purple"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRemove(item.id);
                    onSelect(null);
                  }}
                  aria-label={`Delete ${item.name}`}
                  className="h-8 w-8 rounded-full bg-white/20 text-peach"
                >
                  ×
                </button>
              </div>
            ) : (
              <p
                title={item.name}
                className="mt-1 line-clamp-1 w-full break-words px-1 text-center text-[11px] leading-snug text-peach"
              >
                {item.name}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex flex-col items-center justify-end pb-2">
        <button
          type="button"
          onClick={() => onAddTo(category)}
          aria-label={`Add a ${categoryLabel.toLowerCase()} ingredient`}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-peach/60 text-2xl leading-none text-peach/80 transition hover:scale-110 hover:border-peach hover:text-peach focus-visible:scale-110"
        >
          +
        </button>
        <span className="mt-1 text-[11px] text-peach/70">Add</span>
      </div>
    </div>
  );
}

export default function FridgeShelves({ groups, query, onAdd, onAdjust, onRemove }: Props) {
  const images = useIngredientImages(groups.flatMap((g) => g.items.map((i) => i.searchTerm)));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDrawers, setOpenDrawers] = useState<Category[]>([]);
  const [adding, setAdding] = useState<Category | null>(null);

  // Every category always gets a shelf or drawer, even when it holds nothing yet.
  const groupFor = (value: Category): ShelfGroup => {
    const found = groups.find((g) => g.value === value);
    if (found) return found;
    const meta = CATEGORIES.find((c) => c.value === value);
    return { value, label: meta?.label ?? value, emoji: meta?.emoji ?? '', items: [] };
  };
  const shelves = CATEGORIES.filter((c) => !DRAWER_CATEGORIES.includes(c.value)).map((c) => groupFor(c.value));
  const drawers = CATEGORIES.filter((c) => DRAWER_CATEGORIES.includes(c.value)).map((c) => groupFor(c.value));
  const searching = query.trim() !== '';

  function toggleDrawer(value: Category) {
    setOpenDrawers((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  // Escape closes the add dialog.
  useEffect(() => {
    if (!adding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAdding(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [adding]);

  return (
    <div className="mx-auto mt-4 w-full max-w-lg">
      {/* Fridge cabinet: a tall rectangle, freezer door on top, shelves in the middle, drawers at the bottom */}
      <div className="flex min-h-[46rem] flex-col rounded-md bg-gradient-to-b from-peach to-mauve p-3 shadow-2xl sm:p-4">
        <div className="relative mb-3 h-24 shrink-0 rounded-sm bg-black/10 shadow-inner">
          <span aria-hidden className="absolute right-6 top-1/2 h-12 w-2.5 -translate-y-1/2 rounded-sm bg-mauve shadow-md" />
        </div>

        {/* Fridge interior */}
        <div
          className="relative flex flex-1 flex-col rounded-sm border-[6px] border-black/25 bg-purple p-3 shadow-[inset_0_6px_14px_rgba(0,0,0,0.5)]"
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.05))' }}
        >
          {shelves.map((group) => (
            <div key={group.value} className="mb-3">
              <p className="mb-1 inline-block rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wide text-peach">
                {group.emoji} {group.label} · {group.items.length}
              </p>
              <ItemGrid
                category={group.value}
                categoryLabel={group.label}
                onAddTo={setAdding}
                items={group.items}
                images={images}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdjust={onAdjust}
                onRemove={onRemove}
              />
            </div>
          ))}

          {/* Drawers sit at the bottom of the fridge */}
          <div className="mt-auto grid gap-3 pt-3">
            {drawers.map((group) => {
              const open = (searching && group.items.length > 0) || openDrawers.includes(group.value);
              return (
                <div key={group.value} className="overflow-hidden rounded-sm bg-black/20 shadow-inner">
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden" inert={!open}>
                      <div className="px-2 pt-2">
                        <ItemGrid
                          category={group.value}
                          categoryLabel={group.label}
                          onAddTo={setAdding}
                          items={group.items}
                          images={images}
                          selectedId={selectedId}
                          onSelect={setSelectedId}
                          onAdjust={onAdjust}
                          onRemove={onRemove}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDrawer(group.value)}
                    aria-expanded={open}
                    className={`flex w-full flex-col items-center gap-1.5 bg-peach px-4 pb-2 pt-2.5 text-purple shadow-lg transition-transform duration-300 ${
                      open ? 'translate-y-0.5' : ''
                    }`}
                  >
                    <span aria-hidden className="h-2 w-16 rounded-full bg-mauve" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {group.emoji} {group.label} · {group.items.length}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add dialog, opened by the + on a shelf. The category is preselected from that shelf. */}
      {adding && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add ingredient"
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-24"
          onClick={() => setAdding(null)}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <AddIngredientForm
              initialCategory={adding}
              onSubmit={(name, qty, unit, category, searchTerm) => {
                onAdd(name, qty, unit, category, searchTerm);
                setAdding(null);
              }}
              onCancel={() => setAdding(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
