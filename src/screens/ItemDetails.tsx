import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Share2, Heart, Star, MapPin, MoreHorizontal, Flag } from "lucide-react";
import Button from "../components/Button";
import {
  coverUrl,
  fetchListing,
  photoUrls,
  ratingLabel,
} from "../lib/listings";
import { createReport } from "../lib/trades";
import { getOrCreateConversation } from "../lib/chat";
import type { ListingWithPhotos, Profile } from "../types/database";
import { useAuth } from "../auth/AuthContext";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchListing(id)
      .then(setListing)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, [id]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  const images = photoUrls(listing);
  const owner = (listing.profiles as Profile | null | undefined) ?? null;
  const isOwner = user?.id === listing.owner_id;

  async function startChat() {
    if (!user || !listing) return;
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

  async function report() {
    if (!user || !listing) return;
    const reason = window.prompt("Why are you reporting this listing?");
    if (!reason?.trim()) return;
    try {
      await createReport({
        reporterId: user.id,
        targetType: "listing",
        targetId: listing.id,
        reason: reason.trim(),
      });
      alert("Thanks — report submitted.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not report");
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        <div className="relative">
          <img
            src={images[active] || coverUrl(listing)}
            alt={listing.title}
            className="h-72 w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
            >
              <ChevronLeftIcon />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => void report()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
              >
                <Flag size={16} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow">
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setSaved((s) => !s)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
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
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-brand-500" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        <div className="px-4">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
            <button className="text-gray-400">
              <MoreHorizontal size={22} />
            </button>
          </div>
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

          <div className="mt-5">
            <h2 className="text-sm font-bold text-gray-900">I&apos;m looking for</h2>
            <p className="mt-1 text-sm text-gray-500">{listing.looking_for}</p>
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

      <div className="flex gap-3 border-t border-gray-100 bg-white p-4">
        {isOwner ? (
          <Button fullWidth variant="outline" onClick={() => navigate("/profile")}>
            This is your listing
          </Button>
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
