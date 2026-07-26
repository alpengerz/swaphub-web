import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Share2, Heart, Star, MapPin, Flag, X } from "lucide-react";
import Button from "../components/Button";
import PhotoLightbox from "../components/PhotoLightbox";
import {
  coverUrl,
  fetchListing,
  fetchProfile,
  isOpenToOffers,
  photoUrls,
  ratingLabel,
} from "../lib/listings";
import { createReport } from "../lib/trades";
import { getOrCreateConversation } from "../lib/chat";
import { isSaved, toggleSaved } from "./SavedItems";
import type { ListingWithPhotos, Profile } from "../types/database";
import { useAuth } from "../auth/AuthContext";

const REPORT_REASONS = [
  "Suspicious or scam-like",
  "Prohibited item",
  "Wrong category / misleading",
  "Offensive content",
  "Other",
];

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing">(
    "loading"
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNote, setReportNote] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setSaved(isSaved(id));
    setLoadState("loading");
    fetchListing(id)
      .then(async (row) => {
        if (!row) {
          setListing(null);
          setLoadState("missing");
          return;
        }
        setListing(row);
        const embedded = row.profiles as Profile | null | undefined;
        if (embedded) setOwner(embedded);
        else setOwner(await fetchProfile(row.owner_id));
        setLoadState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed");
        setLoadState("missing");
      });
  }, [id]);

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
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="button" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const images = photoUrls(listing);
  const isOwner = user?.id === listing.owner_id;

  async function startChat() {
    if (!user || !listing || isOwner) return;
    setBusy(true);
    try {
      const conv = await getOrCreateConversation(
        listing.id,
        user.id,
        listing.owner_id
      );
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open chat");
    } finally {
      setBusy(false);
    }
  }

  async function submitReport() {
    if (!user || !listing) return;
    setReportMsg("");
    try {
      const reason = reportNote.trim()
        ? `${reportReason}: ${reportNote.trim()}`
        : reportReason;
      await createReport({
        reporterId: user.id,
        targetType: "listing",
        targetId: listing.id,
        reason,
      });
      setReportMsg("Thanks — report submitted.");
      window.setTimeout(() => setReportOpen(false), 1200);
    } catch (err) {
      setReportMsg(err instanceof Error ? err.message : "Could not report");
    }
  }

  async function shareListing() {
    if (!listing) return;
    const item = listing;
    const url = `${window.location.origin}/item/${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setError("Link copied.");
        window.setTimeout(() => setError(""), 1500);
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (images.length > 0) setLightboxOpen(true);
            }}
            className="block w-full"
            aria-label="View full photo"
          >
            <img
              src={images[active] || coverUrl(listing)}
              alt={listing.title}
              className="h-72 w-full object-cover"
            />
          </button>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
              aria-label="Back"
            >
              <ChevronLeftIcon />
            </button>
            <div className="pointer-events-auto flex gap-2">
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setReportOpen(true);
                    setReportMsg("");
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
                  aria-label="Report listing"
                >
                  <Flag size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => void shareListing()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setSaved(toggleSaved(listing.id))}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow"
                aria-label={saved ? "Unsave item" : "Save item"}
              >
                <Heart
                  size={18}
                  className={saved ? "fill-red-500 text-red-500" : "text-gray-800"}
                />
              </button>
            </div>
          </div>
          {images.length > 0 && (
            <span className="absolute bottom-3 right-4 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1}/{images.length}
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 py-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-5 bg-brand-500" : "w-2 bg-gray-300"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="px-4">
          <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              New
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {ratingLabel(0)}
            </span>
            <span className="text-xs text-gray-400">{listing.condition}</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} /> {listing.location}
          </p>
          {error && <p className="mt-2 text-xs text-brand-600">{error}</p>}

          <div className="mt-5">
            <h2 className="text-sm font-bold text-gray-900">I&apos;m looking for</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isOpenToOffers(listing.looking_for)
                ? "Open to offers — send a fair swap and let’s talk."
                : listing.looking_for}
            </p>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-bold text-gray-900">Description</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {listing.description || "No description provided."}
            </p>
          </div>

          {owner && (
            <div className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left">
              <img
                src={
                  owner.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${owner.display_name ?? "U"}`
                }
                alt={owner.display_name ?? "User"}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {owner.display_name || owner.username || "Trader"}
                </p>
                <p className="text-xs text-gray-500">
                  {owner.city ?? "Philippines"}
                  {owner.email_verified ? " · Verified email" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {isOwner ? (
          <>
            <Button
              className="flex-1"
              onClick={() => navigate(`/edit/${listing.id}`)}
            >
              Edit listing
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/my-listings")}
            >
              My listings
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={() => void startChat()}
            >
              Chat
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate(`/offer/${listing.id}`)}
            >
              Make an Offer
            </Button>
          </>
        )}
      </div>

      {lightboxOpen && images.length > 0 && (
        <PhotoLightbox
          images={images}
          index={active}
          alt={listing.title}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setActive}
        />
      )}

      {reportOpen && (
        <div className="absolute inset-0 z-40 flex flex-col bg-black/40">
          <button
            type="button"
            className="min-h-[25%] flex-1"
            aria-label="Close"
            onClick={() => setReportOpen(false)}
          />
          <div className="rounded-t-3xl bg-white px-4 pb-6 pt-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Report listing</h2>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="rounded-full p-2 text-gray-500"
                aria-label="Close report"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Reason
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="input mt-1"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm font-medium text-gray-700">
              Details (optional)
              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                rows={3}
                className="input mt-1 resize-none"
                placeholder="Anything else we should know?"
              />
            </label>
            {reportMsg && (
              <p className="mt-2 text-sm text-brand-600">{reportMsg}</p>
            )}
            <div className="mt-4">
              <Button fullWidth type="button" onClick={() => void submitReport()}>
                Submit report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
