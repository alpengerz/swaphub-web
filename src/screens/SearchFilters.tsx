import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Chip from "../components/Chip";
import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import BottomNav from "../components/BottomNav";
import { categories, conditions } from "../data";
import { fetchListings } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";
import { useAuth } from "../auth/AuthContext";

export default function SearchFilters() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("All");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [results, setResults] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = useMemo(
    () => ({
      category: activeCat,
      condition,
      query,
    }),
    [activeCat, condition, query]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      fetchListings(filters)
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Search failed");
            setResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters]);

  const mine = user ? results.filter((l) => l.owner_id === user.id) : [];

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="px-4 pb-2 pt-4">
        <h1 className="text-lg font-bold text-gray-900">Search</h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <div className="mt-1 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm">
          <Search size={18} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items or keywords"
            className="w-full bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <Label>Categories</Label>
        <div className="grid grid-cols-5 gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(active ? null : c.id)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-gray-100 bg-white text-gray-600"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{c.label}</span>
              </button>
            );
          })}
        </div>

        <Label>Condition</Label>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            active={condition === "All"}
            onClick={() => setCondition("All")}
          />
          {conditions.map((c) => (
            <Chip
              key={c}
              label={c}
              active={condition === c}
              onClick={() => setCondition(c)}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Results {loading ? "" : `(${results.length})`}
            </h3>
            {(activeCat || condition !== "All" || query.trim()) && (
              <button
                type="button"
                className="text-xs font-semibold text-brand-600"
                onClick={() => {
                  setActiveCat(null);
                  setCondition("All");
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-gray-500">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-gray-500">
              No matches. Clear filters or try other keywords.
            </p>
          )}
          {!loading && mine.length > 0 && !query.trim() && !activeCat && (
            <p className="text-xs text-gray-400">
              Including {mine.length} of your listing{mine.length === 1 ? "" : "s"}.
            </p>
          )}
          {results.map((l) => (
            <div key={l.id} className="relative">
              <ItemCard listing={l} variant="list" />
              {user && l.owner_id === user.id && (
                <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Yours
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-3">
        <Button
          fullWidth
          type="button"
          onClick={() => {
            setLoading(true);
            fetchListings(filters)
              .then(setResults)
              .catch((err) =>
                setError(err instanceof Error ? err.message : "Search failed")
              )
              .finally(() => setLoading(false));
          }}
        >
          Refresh results
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">{children}</h3>
  );
}
