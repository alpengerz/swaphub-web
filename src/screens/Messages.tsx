import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { fetchMyConversations } from "../lib/chat";
import { coverUrl } from "../lib/listings";
import type { ListingWithPhotos, Profile } from "../types/database";
import { useAuth } from "../auth/AuthContext";

type ConvRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  listings?: ListingWithPhotos;
  buyer?: Profile | null;
  seller?: Profile | null;
};

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyConversations(user.id)
      .then((data) => setRows(data as ConvRow[]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="bg-white px-4 pb-3 pt-4">
        <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
          <Search size={18} /> Search conversations
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {loading && (
          <p className="p-4 text-sm text-gray-500">Loading conversations…</p>
        )}
        {!loading && rows.length === 0 && (
          <div className="px-4 pt-10 text-center text-sm text-gray-500">
            No messages yet. Make an offer on a listing to start a chat.
          </div>
        )}
        {rows.map((c) => {
          const partner =
            user?.id === c.buyer_id ? c.seller : c.buyer;
          const listing = c.listings;
          const avatar =
            partner?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.display_name ?? "U"}`;
          const listingImg = listing
            ? coverUrl(listing as ListingWithPhotos)
            : "";
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="flex w-full items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 text-left"
            >
              <div className="relative">
                <img
                  src={avatar}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                {listingImg && (
                  <img
                    src={listingImg}
                    alt=""
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg object-cover ring-2 ring-white"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold text-gray-900">
                    {partner?.display_name || partner?.username || "Trader"}
                  </p>
                  <span className="text-xs text-gray-400">
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500">
                  {listing?.title ?? "Listing"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
