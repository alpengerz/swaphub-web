import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownUp, MapPin, ChevronRight } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { coverUrl, fetchListing, fetchMyListings } from "../lib/listings";
import {
  acceptOfferAndCreateTrade,
  fetchOffer,
  fetchTradeByOffer,
} from "../lib/trades";
import type { ListingWithPhotos } from "../types/database";
import { useAuth } from "../auth/AuthContext";

export default function TradeSummary() {
  const { id: offerId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [receiving, setReceiving] = useState<ListingWithPhotos | null>(null);
  const [giving, setGiving] = useState<ListingWithPhotos[]>([]);
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [existingTradeId, setExistingTradeId] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId || !user) return;
    void (async () => {
      const offer = await fetchOffer(offerId);
      if (!offer) return;
      const o = offer as {
        listing_id: string;
        offered_listing_ids: string[];
        listings?: ListingWithPhotos;
      };
      const target =
        (o.listings as ListingWithPhotos) ||
        (await fetchListing(o.listing_id));
      setReceiving(target);
      setLocation(
        target?.location || profile?.city || "Central area, meet in public"
      );

      const mine = await fetchMyListings(user.id);
      const offered = mine.filter((m) =>
        (o.offered_listing_ids ?? []).includes(m.id)
      );
      // Also try fetch by ids if not owned by me (viewer is seller)
      if (offered.length === 0 && o.offered_listing_ids?.length) {
        const rows = await Promise.all(
          o.offered_listing_ids.map((lid) => fetchListing(lid))
        );
        setGiving(rows.filter(Boolean) as ListingWithPhotos[]);
      } else {
        setGiving(offered);
      }

      const trade = await fetchTradeByOffer(offerId);
      if (trade) setExistingTradeId(trade.id);
    })();
  }, [offerId, user, profile?.city]);

  async function confirm() {
    if (!offerId) return;
    if (existingTradeId) {
      navigate(`/confirmed/${existingTradeId}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const trade = await acceptOfferAndCreateTrade({
        offerId,
        meetingMethod: "Meet in person",
        meetingLocation: location,
      });
      navigate(`/confirmed/${trade.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm trade");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title="Trade Summary" />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <TradeRow
          label="You're giving"
          items={giving.length ? giving : []}
        />

        <div className="my-3 flex justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
            <ArrowDownUp size={16} />
          </span>
        </div>

        {receiving && (
          <TradeRow label="You're getting" items={[receiving]} highlight />
        )}

        <div className="mt-6 rounded-2xl bg-white shadow-card ring-1 ring-black/5">
          <Row label="Meeting method" value="Meet in person" />
          <div className="border-t border-gray-100" />
          <div className="flex items-center gap-3 p-4">
            <MapPin size={16} className="text-brand-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Location</p>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm font-semibold text-gray-900 outline-none"
              />
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">Safety first</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-700">
            Always meet in a public place and inspect items before completing a
            trade.
          </p>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth disabled={busy || !receiving} onClick={() => void confirm()}>
          {busy
            ? "Confirming…"
            : existingTradeId
              ? "View Confirmation"
              : "Confirm Trade"}
        </Button>
      </div>
    </div>
  );
}

function TradeRow({
  label,
  items,
  highlight,
}: {
  label: string;
  items: ListingWithPhotos[];
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-gray-900">{label}</p>
      {items.length === 0 && (
        <p className="rounded-2xl bg-white p-3 text-sm text-gray-500 shadow-card">
          No items selected
        </p>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ${
              highlight ? "ring-brand-200" : "ring-black/5"
            }`}
          >
            <img
              src={coverUrl(item)}
              alt={item.title}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.condition}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}
