import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import SubPageShell from "../components/SubPageShell";
import ItemCard from "../components/ItemCard";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { fetchMyListings } from "../lib/listings";
import type { ListingWithPhotos } from "../types/database";

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyListings(user.id)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SubPageShell
      title="My Listings"
      footer={
        <div className="border-t border-gray-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            fullWidth
            type="button"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate("/post")}
          >
            Post new item
          </Button>
        </div>
      }
    >
      {loading && <p className="text-sm text-gray-500">Loading your listings…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-card ring-1 ring-black/5">
          <p className="text-sm font-semibold text-gray-900">No listings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Post something you’re willing to trade and it will show up here.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((listing) => (
          <div key={listing.id} className="relative">
            <ItemCard listing={listing} variant="list" />
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {listing.status}
            </span>
          </div>
        ))}
      </div>
    </SubPageShell>
  );
}
