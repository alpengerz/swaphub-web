import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Chip from "../components/Chip";
import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import { categories, conditions } from "../data";
import { fetchListings } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";

export default function SearchFilters() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("All");
  const [activeCat, setActiveCat] = useState<string | null>(
    params.get("category")
  );
  const [results, setResults] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const filters = useMemo(
    () => ({
      category: activeCat,
      condition,
      query,
    }),
    [activeCat, condition, query]
  );

  useEffect(() => {
    if (!showResults) return;
    let cancelled = false;
    setLoading(true);
    fetchListings(filters)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, showResults]);

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Search" />

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
          {categories.slice(0, 5).map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
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

        {showResults && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              Results {loading ? "" : `(${results.length})`}
            </h3>
            {loading && <p className="text-sm text-gray-500">Searching…</p>}
            {!loading && results.length === 0 && (
              <p className="text-sm text-gray-500">No matches. Try other filters.</p>
            )}
            {results.map((l) => (
              <ItemCard key={l.id} listing={l} variant="list" />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button
          fullWidth
          onClick={() => {
            setShowResults(true);
            if (showResults) {
              // re-trigger via filters change is automatic; force refresh:
              setLoading(true);
              fetchListings(filters)
                .then(setResults)
                .finally(() => setLoading(false));
            }
          }}
        >
          Show Results
        </Button>
        <button
          onClick={() => navigate("/home")}
          className="mt-2 w-full text-center text-sm font-medium text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">{children}</h3>
  );
}
