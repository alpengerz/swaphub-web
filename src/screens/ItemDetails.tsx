import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Share2, Heart, Star, MapPin, MoreHorizontal } from "lucide-react";
import Button from "../components/Button";
import { getListing, listings, users } from "../data";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = getListing(id);
  const owner = users[listing.ownerId];
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);

  const wanted = listings
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        <div className="relative">
          <img
            src={listing.images[active]}
            alt={listing.title}
            className="h-72 w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow"
            >
              <span className="sr-only">Back</span>
              <ChevronLeftIcon />
            </button>
            <div className="flex gap-2">
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
          <span className="absolute bottom-3 right-4 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
            {active + 1}/{listing.images.length}
          </span>
        </div>

        <div className="flex justify-center gap-2 py-3">
          {listing.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-brand-500" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

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
              {listing.rating}
            </span>
            <span className="text-gray-400">({listing.reviews})</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {listing.ratingLabel}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} /> {listing.location} · {listing.distanceKm} km away
          </p>

          <div className="mt-5">
            <h2 className="text-sm font-bold text-gray-900">I'm looking for</h2>
            <p className="mt-1 text-sm text-gray-500">{listing.lookingFor}</p>
            <div className="mt-3 flex gap-3">
              {wanted.map((w) => (
                <div key={w.id} className="text-center">
                  <img
                    src={w.image}
                    alt={w.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                </div>
              ))}
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-xs font-medium text-gray-500">
                or similar
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-bold text-gray-900">Description</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {listing.description}
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-3 text-left"
          >
            <img
              src={owner.avatar}
              alt={owner.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{owner.name}</p>
              <p className="text-xs text-gray-500">
                {owner.trades} trades · {owner.rating} rating
              </p>
            </div>
            {owner.verified && (
              <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                Verified
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-100 bg-white p-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSaved((s) => !s)}
        >
          {saved ? "Saved" : "Save"}
        </Button>
        <Button className="flex-1" onClick={() => navigate(`/offer/${listing.id}`)}>
          Make an Offer
        </Button>
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
