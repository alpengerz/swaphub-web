import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Bell, MapPin, ChevronDown } from "lucide-react";
import BottomNav from "../components/BottomNav";
import CityPicker from "../components/CityPicker";
import ItemCard from "../components/ItemCard";
import Logo from "../components/Logo";
import PullToRefresh from "../components/PullToRefresh";
import { categories } from "../data";
import { fetchListings } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";
import { useAuth } from "../auth/AuthContext";
import { useUnread } from "../auth/UnreadContext";

export default function Home() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { unreadMessages, refreshUnread } = useUnread();
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityOpen, setCityOpen] = useState(false);

  const loadFeed = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const data = await fetchListings();
      setListings(data);
      await refreshUnread();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [refreshUnread]);

  useEffect(() => {
    void loadFeed(true);
  }, [loadFeed]);

  const city = profile?.city ?? "Metro Manila";
  const nearby = useMemo(() => {
    const inCity = listings.filter(
      (l) => l.location && l.location.toLowerCase() === city.toLowerCase()
    );
    return inCity.length > 0 ? inCity : listings;
  }, [listings, city]);

  const recommended = nearby.slice(0, 6);
  const popular = nearby.slice(0, 8);

  return (
    <div className="relative flex h-full flex-col bg-gray-50">
      <header className="relative z-20 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Logo size={26} />
          <Link
            to="/notifications"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition active:bg-gray-200"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setCityOpen(true)}
          className="mt-2 flex items-center gap-1 rounded-lg py-1.5 pr-2 text-sm font-medium text-gray-600 transition active:bg-gray-100"
        >
          <MapPin size={14} className="text-brand-500" />
          {city}
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="mt-3 flex w-full items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-left text-sm text-gray-400"
        >
          <Search size={18} />
          Search items, skills or categories
          <SlidersHorizontal size={18} className="ml-auto text-gray-500" />
        </button>
      </header>

      <PullToRefresh onRefresh={() => loadFeed(false)}>
        <div className="pb-4">
          {loading && (
            <p className="px-4 pt-6 text-sm text-gray-500">Loading listings…</p>
          )}
          {error && (
            <p className="px-4 pt-6 text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && listings.length === 0 && (
            <div className="px-4 pt-10 text-center">
              <p className="font-semibold text-gray-900">No listings yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to post something to trade.
              </p>
              <button
                type="button"
                onClick={() => navigate("/post")}
                className="mt-4 text-sm font-semibold text-brand-600"
              >
                Post an item →
              </button>
            </div>
          )}

          {recommended.length > 0 && (
            <Section title="Recommended for you" onSeeAll={() => navigate("/search")}>
              <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
                {recommended.map((l) => (
                  <ItemCard key={l.id} listing={l} />
                ))}
              </div>
            </Section>
          )}

          <div className="mt-5 px-4">
            <SectionHeader title="Categories" onSeeAll={() => navigate("/search")} />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[
                ...categories.filter((c) => c.id !== "other").slice(0, 7),
                categories.find((c) => c.id === "other")!,
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate(`/search?category=${c.id}`)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-black/5">
                      <Icon size={22} />
                    </span>
                    <span className="text-[11px] font-medium text-gray-600">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {popular.length > 0 && (
            <Section title={`Popular near ${city}`} onSeeAll={() => navigate("/search")}>
              <div className="space-y-3 px-4">
                {popular.map((l) => (
                  <ItemCard key={l.id} listing={l} variant="list" />
                ))}
              </div>
            </Section>
          )}
        </div>
      </PullToRefresh>

      <BottomNav />

      {cityOpen && (
        <CityPicker
          city={city}
          onClose={() => setCityOpen(false)}
          onSelect={async (next) => {
            await updateProfile({ city: next });
          }}
        />
      )}
    </div>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {onSeeAll && (
        <button
          type="button"
          onClick={onSeeAll}
          className="text-sm font-semibold text-brand-600"
        >
          See all
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <div className="px-4">
        <SectionHeader title={title} onSeeAll={onSeeAll} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
