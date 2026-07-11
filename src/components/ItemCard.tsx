import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Listing } from "../data";

interface ItemCardProps {
  listing: Listing;
  variant?: "grid" | "list";
}

export default function ItemCard({ listing, variant = "grid" }: ItemCardProps) {
  const navigate = useNavigate();
  const go = () => navigate(`/item/${listing.id}`);

  if (variant === "list") {
    return (
      <button
        onClick={go}
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card ring-1 ring-black/5 transition active:scale-[0.99]"
      >
        <img
          src={listing.image}
          alt={listing.title}
          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{listing.title}</p>
          <p className="truncate text-xs text-gray-500">
            For {listing.lookingFor}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={12} /> {listing.distanceKm} km away
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={go}
      className="w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-card ring-1 ring-black/5 transition active:scale-[0.98]"
    >
      <img
        src={listing.image}
        alt={listing.title}
        className="h-28 w-full object-cover"
      />
      <div className="p-3">
        <p className="truncate font-semibold text-gray-900">{listing.title}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
          For {listing.lookingFor}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={12} /> {listing.distanceKm} km
        </p>
      </div>
    </button>
  );
}
