import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Chip from "../components/Chip";
import ItemCard from "../components/ItemCard";
import BottomNav from "../components/BottomNav";
import PullToRefresh from "../components/PullToRefresh";
import { categories, conditions, normalizeCategoryId } from "../data";
import { fetchListings } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";
import { useAuth } from "../auth/AuthContext";

export default function SearchFilters() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [condition, setCondition] = useState("All");
  const [activeCat, setActiveCat] = useState<string | null>(() =>
    normalizeCategoryId(searchParams.get("category"))
  );
  const [results, setResults] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveCat(normalizeCategoryId(searchParams.get("category")));
    const q = searchParams.get("q");
    if (q != null) setQuery(q);
  }, [searchParams]);

  const filters = useMemo(
    () => ({
      category: activeCat,
      condition,
      query,
    }),
    [activeCat, condition, query]
  );

  const runSearch = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      setError("");
      try {
        setResults(await fetchListings(filters));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(true);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [runSearch]);

  const mine = user ? results.filter((l) => l.owner_id === user.id) : [];

  function clearFilters() {
    setActiveCat(null);
    setCondition("All");
    setQuery("");
  }

  const filtersBlock = (
    <>
      <Label>Categories</Label>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = c.icon;
          const active = activeCat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(active ? null : c.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition md:flex-row md:justify-start md:gap-2 md:px-3 ${
                active
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium md:text-xs">
                {c.label}
              </span>
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
    </>
  );

  const resultsBlock = (
    <div className="mt-6 md:mt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 md:text-lg">
          Results {loading ? "" : `(${results.length})`}
        </h3>
        {(activeCat || condition !== "All" || query.trim()) && (
          <button
            type="button"
            className="text-xs font-semibold text-brand-600 md:text-sm"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-2 text-sm text-gray-500">Searching…</p>}
      {!loading && results.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No matches. Clear filters or try other keywords.
        </p>
      )}
      {!loading && mine.length > 0 && !query.trim() && !activeCat && (
        <p className="mt-2 text-xs text-gray-400">
          Including {mine.length} of your listing
          {mine.length === 1 ? "" : "s"}.
        </p>
      )}

      {/* Mobile list */}
      <div className="mt-3 space-y-3 md:hidden">
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

      {/* Desktop marketplace grid */}
      <div className="mt-4 hidden grid-cols-3 gap-4 md:grid lg:grid-cols-4 xl:grid-cols-5">
        {results.map((l) => (
          <div key={l.id} className="relative">
            <ItemCard listing={l} variant="tile" />
            {user && l.owner_id === user.id && (
              <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Yours
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-white md:bg-gray-50">
      <header className="px-4 pb-2 pt-4 md:hidden">
        <h1 className="text-lg font-bold text-gray-900">Search</h1>
      </header>

      <PullToRefresh onRefresh={() => runSearch(false)}>
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 md:pt-6">
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm md:rounded-full md:bg-white md:shadow-card md:ring-1 md:ring-black/5">
            <Search size={18} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items or keywords"
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Mobile: stacked filters + results */}
          <div className="md:hidden">
            {filtersBlock}
            {resultsBlock}
          </div>

          {/* Desktop: sidebar + grid */}
          <div className="mt-6 hidden gap-8 md:flex">
            <aside className="w-64 shrink-0 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5 lg:w-72">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              {filtersBlock}
            </aside>
            <div className="min-w-0 flex-1">{resultsBlock}</div>
          </div>
        </div>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">{children}</h3>
  );
}
