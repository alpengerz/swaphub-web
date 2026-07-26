import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { coverUrl, fetchListing, fetchMyListings } from "../lib/listings";
import { createOffer } from "../lib/trades";
import type { ListingWithPhotos } from "../types/database";
import { useAuth } from "../auth/AuthContext";

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [mine, setMine] = useState<ListingWithPhotos[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing">(
    "loading"
  );

  useEffect(() => {
    if (!id || !user) return;
    setLoadState("loading");
    void fetchListing(id).then((row) => {
      if (!row) {
        setListing(null);
        setLoadState("missing");
        return;
      }
      if (row.owner_id === user.id) {
        navigate(`/item/${row.id}`, { replace: true });
        return;
      }
      setListing(row);
      setLoadState("ready");
    });
    void fetchMyListings(user.id).then((rows) =>
      setMine(rows.filter((r) => r.status === "active" && r.id !== id))
    );
  }, [id, user, navigate]);

  function toggle(listingId: string) {
    setSelected((s) =>
      s.includes(listingId) ? s.filter((x) => x !== listingId) : [...s, listingId]
    );
  }

  async function send() {
    if (!user || !listing || selected.length === 0) return;
    if (listing.owner_id === user.id) {
      setError("You can’t make an offer on your own listing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { conversationId } = await createOffer({
        listingId: listing.id,
        fromUserId: user.id,
        sellerId: listing.owner_id,
        offeredListingIds: selected,
        message,
      });
      navigate(`/chat/${conversationId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send offer");
    } finally {
      setBusy(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (loadState === "missing" || !listing) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold text-gray-900">Listing not found</p>
        <Button type="button" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const offered = mine.filter((m) => selected.includes(m.id));

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title="Make an Offer" />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <SectionLabel>You&apos;re offering</SectionLabel>
        {offered.length === 0 && (
          <p className="mb-2 text-sm text-gray-500">
            Select one or more of your listings below.
          </p>
        )}
        <div className="space-y-2">
          {offered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5"
            >
              <img
                src={coverUrl(item)}
                alt={item.title}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.condition}</p>
              </div>
              <button onClick={() => toggle(item.id)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {mine
            .filter((m) => !selected.includes(m.id))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-3 text-left"
              >
                <img
                  src={coverUrl(item)}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-brand-700">Tap to add</p>
                </div>
                <Plus size={16} className="text-brand-600" />
              </button>
            ))}
          {mine.length === 0 && (
            <button
              onClick={() => navigate("/post")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 py-3 text-sm font-semibold text-brand-600"
            >
              <Plus size={16} /> Post an item to offer first
            </button>
          )}
        </div>

        <SectionLabel className="mt-6">You&apos;re looking for</SectionLabel>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5">
          <img
            src={coverUrl(listing)}
            alt={listing.title}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{listing.title}</p>
            <p className="text-xs text-gray-500">{listing.condition}</p>
          </div>
        </div>

        <SectionLabel className="mt-6">Add a message (optional)</SectionLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Hi! I'm interested in your item. Here's what I can offer."
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-400"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button
          fullWidth
          disabled={selected.length === 0 || busy}
          onClick={() => void send()}
        >
          {busy ? "Sending…" : "Send Offer"}
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`mb-2 text-sm font-bold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}
