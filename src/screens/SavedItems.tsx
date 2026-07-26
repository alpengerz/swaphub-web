import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubPageShell from "../components/SubPageShell";
import ItemCard from "../components/ItemCard";
import { fetchListing } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";

const SAVED_KEY = "swaphub.saved";

export function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(id);
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export default function SavedItems() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getSavedIds();
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => fetchListing(id)))
      .then((list) =>
        setRows(list.filter((x): x is ListingWithPhotos => Boolean(x)))
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SubPageShell title="Saved Items" backTo="/profile">
      {loading && <p className="text-sm text-gray-500">Loading saved items…</p>}
      {!loading && rows.length === 0 && (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-card ring-1 ring-black/5">
          <p className="text-sm font-semibold text-gray-900">No saved items</p>
          <p className="mt-1 text-sm text-gray-500">
            Tap the heart on a listing to save it for later.
          </p>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-4 text-sm font-semibold text-brand-600"
          >
            Browse listings →
          </button>
        </div>
      )}
      <div className="space-y-2">
        {rows.map((listing) => (
          <ItemCard key={listing.id} listing={listing} variant="list" />
        ))}
      </div>
    </SubPageShell>
  );
}
