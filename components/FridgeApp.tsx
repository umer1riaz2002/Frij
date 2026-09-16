'use client';

import { useEffect, useState } from 'react';
import { Category, FridgeItem, SpiceItem, GroceryItem } from '@/lib/types';
import {
  loadFridge,
  saveFridge,
  loadSpiceRack,
  saveSpiceRack,
  loadGroceryList,
  saveGroceryList,
} from '@/lib/storage';
import FridgeGrid from './FridgeGrid';
import SpiceRack from './SpiceRack';
import GroceryList from './GroceryList';
import RecipePanel from './RecipePanel';
import Sidebar, { Page } from './Sidebar';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FridgeApp() {
  const [page, setPage] = useState<Page>('frij');
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [spices, setSpices] = useState<SpiceItem[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFridge());
    setSpices(loadSpiceRack());
    setGroceries(loadGroceryList());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveFridge(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) saveSpiceRack(spices);
  }, [spices, hydrated]);

  useEffect(() => {
    if (hydrated) saveGroceryList(groceries);
  }, [groceries, hydrated]);

  function addItem(name: string, qty: number, unit: string, category: Category, searchTerm: string) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.name.toLowerCase() === name.toLowerCase() && i.unit === unit
      );
      if (existing) {
        return prev.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id: makeId(), name, searchTerm, qty, unit, category }];
    });
  }

  function adjustQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addSpice(name: string, searchTerm: string) {
    setSpices((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id: makeId(), name, searchTerm }];
    });
  }

  function removeSpice(id: string) {
    setSpices((prev) => prev.filter((s) => s.id !== id));
  }

  function addGrocery(name: string, qty: number, unit: string, searchTerm: string) {
    setGroceries((prev) => {
      if (prev.some((g) => g.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id: makeId(), name, searchTerm, qty, unit }];
    });
  }

  function removeGrocery(id: string) {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  }

  // Spize Rak contents count as "on hand" for recipe matching, same as
  // anything in the fridge - merged here before being sent to search.
  const searchTerms = [...items.map((i) => i.searchTerm), ...spices.map((s) => s.searchTerm)];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ice">Frij</h1>
        <p className="mt-1 text-sm text-muted">Open it up, see what you&apos;ve got, stop deciding.</p>
      </header>

      <div className="flex flex-col gap-6 md:flex-row">
        <Sidebar active={page} onSelect={setPage} />

        <div className="min-w-0 flex-1">
          {page === 'frij' && (
            <div className="grid gap-10 md:grid-cols-2">
              <FridgeGrid items={items} onAdd={addItem} onAdjust={adjustQty} onRemove={removeItem} />
              <RecipePanel searchTerms={searchTerms} />
            </div>
          )}

          {page === 'spice' && <SpiceRack spices={spices} onAdd={addSpice} onRemove={removeSpice} />}

          {page === 'grocery' && (
            <GroceryList
              groceries={groceries}
              fridgeItems={items}
              onAdd={addGrocery}
              onRemove={removeGrocery}
            />
          )}
        </div>
      </div>
    </main>
  );
}
